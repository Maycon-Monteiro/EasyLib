import { requestFirebaseFcmToken } from '../firebase';
import { pickRandomExtremeNotification } from '../data/notificationsData';

export interface PushReminderSettings {
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}

const PUSH_SETTINGS_KEY = 'easylib_push_settings_v1';

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

async function getReadyServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (!existing) {
    // VitePWA injects SW at /sw.js (or /dev-sw.js?dev-sw in dev mode)
    const swUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js';
    try {
      await navigator.serviceWorker.register(swUrl, {
        type: import.meta.env.DEV ? 'module' : 'classic',
        scope: '/',
      });
    } catch {
      // Fallback: let navigator.serviceWorker.ready resolve if already registered
    }
  }
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            'O Service Worker de notificações ainda não ficou ativo. Recarregue a página ou abra o app fora de pré-visualização.'
          )
        ),
      12_000
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

export async function subscribeToBackgroundPush(
  settings: PushReminderSettings,
  uid?: string | null
): Promise<{ subscription: PushSubscription; permission: NotificationPermission; fcmToken: string }> {
  if (!isPushSupported()) {
    throw new Error('Este navegador não suporta notificações push em segundo plano.');
  }

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    throw new Error(
      isRunningInIframe()
        ? 'O navegador bloqueia pedidos de permissão dentro do iframe. Abra o EasyLib em uma aba própria ou instale o app e ative as notificações.'
        : 'Permissão de notificação negada ou bloqueada. Autorize as notificações nas configurações do navegador.'
    );
  }

  const keyRes = await fetch('/api/push/vapid-public-key');
  if (!keyRes.ok) {
    throw new Error('Não foi possível obter a chave pública push do servidor.');
  }
  const { publicKey } = (await keyRes.json()) as { publicKey: string };
  const expectedKeyBytes = urlBase64ToUint8Array(publicKey);

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

  const jsonSub = sub.toJSON();
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: jsonSub,
      uid: uid || null,
      fcmToken,
      ultimoAcessoMs: Date.now(),
      reminderEnabled: settings.reminderEnabled,
      reminderHour: settings.reminderHour,
      reminderMinute: settings.reminderMinute,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Falha ao salvar assinatura push no servidor.');
  }

  savePushReminderSettings(settings);
  return { subscription: sub, permission, fcmToken };
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
        ultimoAcessoMs: Date.now()
      })
    });
  } catch {
    // Non-fatal background access ping
  }
}

export async function unsubscribeFromBackgroundPush(): Promise<void> {
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
  customMessage?: { title?: string; body?: string }
): Promise<{ message: string }> {
  let sub = await getActivePushSubscription();
  if (!sub) {
    throw new Error('Ative as notificações push primeiro.');
  }

  const randomAlert = pickRandomExtremeNotification();
  const payloadTitle = customMessage?.title || randomAlert.titulo;
  const payloadBody = customMessage?.body || randomAlert.corpo;

  let res = await fetch('/api/push/send-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      delaySeconds,
      title: payloadTitle,
      body: payloadBody,
    }),
  });

  // Auto re-sync if server restarted or subscription expired
  if (res.status === 404 || res.status === 410) {
    const refreshed = await subscribeToBackgroundPush(loadPushReminderSettings());
    sub = refreshed.subscription;
    res = await fetch('/api/push/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        delaySeconds,
        title: payloadTitle,
        body: payloadBody,
      }),
    });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Não foi possível enviar a notificação push.');
  }

  return {
    message:
      data.message ||
      (delaySeconds > 0
        ? `Push agendado para ${delaySeconds}s! Você pode minimizar ou fechar esta aba.`
        : `Notificação enviada: "${payloadTitle}"`),
  };
}
