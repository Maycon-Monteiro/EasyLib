import { requestFirebaseFcmToken } from '../firebase';
import { pickRandomExtremeNotification } from '../data/notificationsData';

export interface PushReminderSettings {
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

export type NotificationDeliveryMode = 'webpush' | 'local';

const PUSH_SETTINGS_KEY = 'easylib_push_settings_v1';
const LOCAL_REMINDER_DAY_KEY = 'easylib_local_reminder_day_v1';

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function loadPushReminderSettings(): PushReminderSettings {
  try {
    const raw = localStorage.getItem(PUSH_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        reminderEnabled: Boolean(parsed.reminderEnabled),
        reminderHour:
          typeof parsed.reminderHour === 'number'
            ? Math.max(0, Math.min(23, Math.trunc(parsed.reminderHour)))
            : 19,
        reminderMinute:
          typeof parsed.reminderMinute === 'number'
            ? Math.max(0, Math.min(59, Math.trunc(parsed.reminderMinute)))
            : 0,
      };
    }
  } catch {
    // Use defaults
  }
  return { reminderEnabled: true, reminderHour: 19, reminderMinute: 0 };
}

export function savePushReminderSettings(settings: PushReminderSettings): void {
  try {
    localStorage.setItem(PUSH_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota issues
  }
}

export function isBasicNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

function applicationServerKeysMatch(
  existingKey: ArrayBuffer | null | undefined,
  expectedKeyBytes: Uint8Array<ArrayBuffer>
): boolean {
  if (!existingKey) return false;
  const existingBytes = new Uint8Array(existingKey);
  if (existingBytes.length !== expectedKeyBytes.length) return false;
  for (let i = 0; i < existingBytes.length; i++) {
    if (existingBytes[i] !== expectedKeyBytes[i]) return false;
  }
  return true;
}

export function isRunningInIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

async function fetchJsonSafe<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: T | null }> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, data: null };
    }
    const data = (await res.json().catch(() => null)) as T | null;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

export async function getReadyServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    throw new Error('Service Worker indisponível neste navegador.');
  }

  let existing = await navigator.serviceWorker.getRegistration('/');
  if (!existing) {
    existing = await navigator.serviceWorker.getRegistration();
  }

  if (existing?.active) {
    return existing;
  }

  if (!existing) {
    const swUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js';
    try {
      existing = await navigator.serviceWorker.register(swUrl, {
        type: import.meta.env.DEV ? 'module' : 'classic',
        scope: '/',
      });
    } catch {
      // Fallback: let navigator.serviceWorker.ready attempt to resolve
    }
  }

  if (existing?.active) {
    return existing;
  }

  const waitingWorker = existing?.waiting || existing?.installing;
  if (waitingWorker) {
    await new Promise<void>((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      const timer = setTimeout(done, 4_000);
      waitingWorker.addEventListener('statechange', () => {
        if (waitingWorker.state === 'activated' || waitingWorker.state === 'redundant') {
          clearTimeout(timer);
          done();
        }
      });
    });
    if (existing?.active) {
      return existing;
    }
  }

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'O Service Worker de notificações ainda não ficou ativo. Recarregue a página ou abra o app fora da pré-visualização.'
          )
        ),
      6_000
    )
  );
  return Promise.race([navigator.serviceWorker.ready, timeoutPromise]);
}

export async function getActivePushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const reg = await getReadyServiceWorkerRegistration();
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}

export async function showLocalBrowserNotification(
  title: string,
  body: string,
  tag = 'easylib-local-alert'
): Promise<boolean> {
  if (!isBasicNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const cleanTitle = (title || 'EasyLib — Lembrete de Libras').slice(0, 120);
  const cleanBody = (body || 'Hora de praticar seus sinais hoje!').slice(0, 300);

  if ('serviceWorker' in navigator) {
    try {
      const reg = await getReadyServiceWorkerRegistration();
      await reg
        .showNotification(cleanTitle, {
          body: cleanBody,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag,
          data: { url: '/' },
        })
        .catch(() =>
          reg.showNotification(cleanTitle, {
            body: cleanBody,
            icon: '/pwa-192x192.png',
          })
        );
      return true;
    } catch {
      // Fall through to window Notification API
    }
  }

  try {
    const notification = new Notification(cleanTitle, {
      body: cleanBody,
      icon: '/pwa-192x192.png',
      tag,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return true;
  } catch {
    return false;
  }
}

export async function subscribeToBackgroundPush(
  settings: PushReminderSettings,
  uid?: string | null
): Promise<{
  mode: NotificationDeliveryMode;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
  fcmToken: string;
}> {
  if (!isBasicNotificationSupported()) {
    throw new Error('Este navegador não suporta notificações.');
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    throw new Error(
      isRunningInIframe()
        ? 'O navegador bloqueia pedidos de notificação dentro do painel de pré-visualização. Abra o EasyLib em uma nova aba para autorizar.'
        : 'Permissão de notificação negada ou bloqueada. Autorize as notificações no cadeado/configurações do navegador.'
    );
  }

  const normalizedSettings: PushReminderSettings = {
    ...settings,
    reminderEnabled: true,
  };
  savePushReminderSettings(normalizedSettings);

  // If browser lacks PushManager/SW or backend /api/push is absent (e.g., static hosting),
  // keep local browser notifications active rather than failing completely.
  if (!isPushSupported()) {
    return { mode: 'local', subscription: null, permission, fcmToken: '' };
  }

  const keyRes = await fetchJsonSafe<{ publicKey?: string }>('/api/push/vapid-public-key');
  if (!keyRes.ok || !keyRes.data?.publicKey) {
    return { mode: 'local', subscription: null, permission, fcmToken: '' };
  }

  try {
    const expectedKeyBytes = urlBase64ToUint8Array(keyRes.data.publicKey);
    const reg = await getReadyServiceWorkerRegistration();
    let sub = await reg.pushManager.getSubscription();
    if (sub && !applicationServerKeysMatch(sub.options?.applicationServerKey, expectedKeyBytes)) {
      await sub.unsubscribe().catch(() => undefined);
      sub = null;
    }

    if (!sub) {
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: expectedKeyBytes,
        });
      } catch {
        const stale = await reg.pushManager.getSubscription().catch(() => null);
        if (stale) {
          await stale.unsubscribe().catch(() => undefined);
        }
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: expectedKeyBytes,
        });
      }
    }

    const firebaseToken = await requestFirebaseFcmToken(reg);
    const fcmToken = (firebaseToken || sub.endpoint || '').slice(0, 512);

    const subRes = await fetchJsonSafe<{ ok?: boolean; error?: string }>('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        uid: uid || null,
        fcmToken,
        ultimoAcessoMs: Date.now(),
        reminderEnabled: normalizedSettings.reminderEnabled,
        reminderHour: normalizedSettings.reminderHour,
        reminderMinute: normalizedSettings.reminderMinute,
        timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      }),
    });

    if (!subRes.ok) {
      return { mode: 'local', subscription: sub, permission, fcmToken };
    }

    return { mode: 'webpush', subscription: sub, permission, fcmToken };
  } catch {
    return { mode: 'local', subscription: null, permission, fcmToken: '' };
  }
}

export async function syncLastAccessToPushServer(uid?: string | null): Promise<void> {
  try {
    const sub = await getActivePushSubscription();
    if (!sub) return;
    await fetch('/api/push/ping-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        uid: uid || null,
        ultimoAcessoMs: Date.now(),
      }),
    });
  } catch {
    // Non-fatal background access ping
  }
}

export async function unsubscribeFromBackgroundPush(): Promise<void> {
  const current = loadPushReminderSettings();
  savePushReminderSettings({ ...current, reminderEnabled: false });

  const sub = await getActivePushSubscription();
  if (!sub) return;
  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => undefined);
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  }).catch(() => undefined);
}

export async function sendBackgroundPushTest(
  delaySeconds = 0,
  customMessage?: { title?: string; body?: string },
  uid?: string | null
): Promise<{ message: string; mode: NotificationDeliveryMode }> {
  if (!isBasicNotificationSupported()) {
    throw new Error('Este navegador não suporta notificações.');
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    throw new Error(
      isRunningInIframe()
        ? 'O navegador bloqueia notificações dentro da pré-visualização. Abra o EasyLib em uma nova aba e autorize.'
        : 'Autorize as notificações no navegador antes de testar.'
    );
  }

  const randomAlert = pickRandomExtremeNotification();
  const payloadTitle = customMessage?.title || randomAlert.titulo;
  const payloadBody = customMessage?.body || randomAlert.corpo;

  let sub = await getActivePushSubscription();
  if (!sub && isPushSupported()) {
    const synced = await subscribeToBackgroundPush(loadPushReminderSettings(), uid).catch(() => null);
    if (synced?.subscription) {
      sub = synced.subscription;
    }
  }

  if (sub) {
    let pushRes = await fetchJsonSafe<{ ok?: boolean; message?: string; error?: string }>(
      '/api/push/send-test',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          delaySeconds,
          title: payloadTitle,
          body: payloadBody,
        }),
      }
    );

    if (pushRes.status === 404 || pushRes.status === 410) {
      const refreshed = await subscribeToBackgroundPush(loadPushReminderSettings(), uid).catch(
        () => null
      );
      if (refreshed?.subscription) {
        sub = refreshed.subscription;
        pushRes = await fetchJsonSafe<{ ok?: boolean; message?: string; error?: string }>(
          '/api/push/send-test',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: sub.endpoint,
              delaySeconds,
              title: payloadTitle,
              body: payloadBody,
            }),
          }
        );
      }
    }

    if (pushRes.ok) {
      return {
        mode: 'webpush',
        message:
          pushRes.data?.message ||
          (delaySeconds > 0
            ? `Push agendado para ${delaySeconds}s! Você pode minimizar ou fechar esta aba.`
            : `Notificação push enviada: "${payloadTitle}"`),
      };
    }
  }

  // Reliable local Service Worker / Browser Notification fallback
  if (delaySeconds > 0) {
    setTimeout(() => {
      void showLocalBrowserNotification(payloadTitle, payloadBody, `easylib-test-${Date.now()}`);
    }, delaySeconds * 1000);

    return {
      mode: 'local',
      message: `Lembrete local agendado para ${delaySeconds}s neste navegador (mantenha a aba aberta).`,
    };
  }

  const shown = await showLocalBrowserNotification(
    payloadTitle,
    payloadBody,
    `easylib-now-${Date.now()}`
  );
  if (!shown) {
    throw new Error(
      'O sistema operacional ou navegador bloqueou a exibição da notificação. Verifique as permissões do site.'
    );
  }

  return {
    mode: 'local',
    message: `Notificação enviada pelo navegador: "${payloadTitle}"`,
  };
}

export function startLocalReminderMonitor(): () => void {
  if (typeof window === 'undefined' || !isBasicNotificationSupported()) {
    return () => undefined;
  }

  const checkSchedule = () => {
    if (Notification.permission !== 'granted') return;
    const settings = loadPushReminderSettings();
    if (!settings.reminderEnabled) return;

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')}`;

    try {
      if (localStorage.getItem(LOCAL_REMINDER_DAY_KEY) === todayKey) {
        return;
      }
    } catch {
      // Ignore storage error
    }

    const nowTotalMin = now.getHours() * 60 + now.getMinutes();
    const targetTotalMin = settings.reminderHour * 60 + settings.reminderMinute;

    if (nowTotalMin >= targetTotalMin && nowTotalMin <= targetTotalMin + 15) {
      try {
        localStorage.setItem(LOCAL_REMINDER_DAY_KEY, todayKey);
      } catch {
        // Ignore storage error
      }
      const alert = pickRandomExtremeNotification();
      void showLocalBrowserNotification(alert.titulo, alert.corpo, `easylib-daily-${todayKey}`);
    }
  };

  checkSchedule();
  const intervalId = window.setInterval(checkSchedule, 30_000);
  return () => window.clearInterval(intervalId);
}
