import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Clock, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import {
  getActivePushSubscription,
  getNotificationPermissionState,
  isBasicNotificationSupported,
  isPushSupported,
  isRunningInIframe,
  loadPushReminderSettings,
  NotificationDeliveryMode,
  PushReminderSettings,
  savePushReminderSettings,
  sendBackgroundPushTest,
  subscribeToBackgroundPush,
  unsubscribeFromBackgroundPush
} from '../services/pushNotificationService';
import { soundService } from '../services/soundService';

interface PushNotificationPanelProps {
  uid?: string | null;
  onTokenRegistered?: (fcmToken: string) => void;
}

export const PushNotificationPanel: React.FC<PushNotificationPanelProps> = ({
  uid,
  onTokenRegistered
}) => {
  const [supported] = useState(() => isBasicNotificationSupported());
  const [pushApiAvailable] = useState(() => isPushSupported());
  const [inIframe] = useState(() => isRunningInIframe());
  const [permission, setPermission] = useState(() => getNotificationPermissionState());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deliveryMode, setDeliveryMode] = useState<NotificationDeliveryMode>('local');
  const [settings, setSettings] = useState<PushReminderSettings>(() => loadPushReminderSettings());
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const notificationsActive = isSubscribed || (permission === 'granted' && settings.reminderEnabled);

  useEffect(() => {
    if (!supported) return;
    let active = true;

    const refreshState = async () => {
      const perm = getNotificationPermissionState();
      const sub = pushApiAvailable ? await getActivePushSubscription() : null;
      if (!active) return;

      setPermission(perm);
      setIsSubscribed(Boolean(sub));
      if (sub) {
        setDeliveryMode('webpush');
      }

      if (perm === 'granted' && loadPushReminderSettings().reminderEnabled) {
        const synced = await subscribeToBackgroundPush(loadPushReminderSettings(), uid).catch(
          () => null
        );
        if (!active || !synced) return;
        setDeliveryMode(synced.mode);
        setIsSubscribed(Boolean(synced.subscription));
        if (synced.fcmToken) {
          onTokenRegistered?.(synced.fcmToken);
        }
      }
    };

    void refreshState();
    return () => {
      active = false;
    };
  }, [supported, pushApiAvailable, uid, onTokenRegistered]);

  const timeString = `${String(settings.reminderHour).padStart(2, '0')}:${String(
    settings.reminderMinute
  ).padStart(2, '0')}`;

  const handleEnableOrSyncPush = async (nextSettings = settings) => {
    soundService.playTap();
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const result = await subscribeToBackgroundPush(nextSettings, uid);
      setPermission(result.permission);
      setIsSubscribed(Boolean(result.subscription));
      setDeliveryMode(result.mode);
      setSettings((prev) => ({ ...prev, ...nextSettings, reminderEnabled: true }));
      if (result.fcmToken) {
        onTokenRegistered?.(result.fcmToken);
      }
      soundService.playCorrect();
      setStatusMsg(
        result.mode === 'webpush'
          ? 'Notificações push em segundo plano ativadas com sucesso!'
          : 'Notificações do navegador ativadas! Os lembretes e testes funcionarão diretamente neste aparelho.'
      );
    } catch (err) {
      soundService.playIncorrect();
      setPermission(getNotificationPermissionState());
      setErrorMsg(err instanceof Error ? err.message : 'Não foi possível ativar as notificações.');
    } finally {
      setBusy(false);
    }
  };

  const handleDisablePush = async () => {
    soundService.playTap();
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      await unsubscribeFromBackgroundPush();
      setIsSubscribed(false);
      setSettings((prev) => ({ ...prev, reminderEnabled: false }));
      setStatusMsg('Notificações desativadas neste dispositivo.');
    } finally {
      setBusy(false);
    }
  };

  const handleTimeChange = async (value: string) => {
    const [hStr, mStr] = value.split(':');
    const hour = Math.max(0, Math.min(23, Number(hStr) || 19));
    const minute = Math.max(0, Math.min(59, Number(mStr) || 0));
    const next: PushReminderSettings = {
      ...settings,
      reminderEnabled: true,
      reminderHour: hour,
      reminderMinute: minute
    };
    setSettings(next);
    savePushReminderSettings(next);
    if (notificationsActive) {
      await handleEnableOrSyncPush(next);
    }
  };

  const handleTestPush = async (delaySeconds: number) => {
    soundService.playTap();
    setBusy(true);
    setErrorMsg(null);
    setStatusMsg(null);
    try {
      const result = await sendBackgroundPushTest(delaySeconds, undefined, uid);
      setPermission(getNotificationPermissionState());
      setDeliveryMode(result.mode);
      if (result.mode === 'webpush') {
        setIsSubscribed(true);
      }
      soundService.playCorrect();
      setStatusMsg(result.message);
    } catch (err) {
      soundService.playIncorrect();
      setPermission(getNotificationPermissionState());
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao disparar notificação.');
    } finally {
      setBusy(false);
    }
  };

  const currentHref = typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              notificationsActive ? 'bg-[#F0FDFA] text-[#0D9488]' : 'bg-[#FFF1E6] text-[#EA580C]'
            }`}
          >
            {notificationsActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base text-[#1C1917]">
              Notificações e lembretes diários
            </h3>
            <p className="text-xs text-[#57534E] font-medium">
              {notificationsActive && deliveryMode === 'webpush'
                ? 'Web Push ativo — funciona mesmo com o aplicativo fechado.'
                : notificationsActive
                ? 'Notificações do navegador ativas neste aparelho.'
                : 'Receba lembretes divertidos da Libi para proteger sua ofensiva diária.'}
            </p>
          </div>
        </div>

        {supported && (
          notificationsActive ? (
            <button
              type="button"
              disabled={busy}
              onClick={handleDisablePush}
              className="tactile-btn px-4 py-2 rounded-xl bg-[#F3F0EA] hover:bg-[#E8E2D9] text-[#1C1917] font-bold text-xs border-b-[3px] border-[#D6CFC5] cursor-pointer shrink-0"
            >
              Desativar
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => handleEnableOrSyncPush()}
              className="tactile-btn px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-60 text-white font-bold text-xs uppercase border-b-[3px] border-[#115E59] cursor-pointer shrink-0"
            >
              {busy ? 'Ativando...' : 'Ativar notificações'}
            </button>
          )
        )}
      </div>

      {!supported && (
        <p className="text-xs font-medium text-[#78716C] bg-[#FAF9F6] p-3 rounded-xl border border-[#E8E2D9]">
          Seu navegador atual não disponibiliza notificações do sistema. Instale o EasyLib na tela inicial (Chrome, Edge ou Safari iOS 16.4+) para receber avisos.
        </p>
      )}

      {supported && permission === 'denied' && (
        <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {inIframe
                ? 'O navegador bloqueou notificações dentro desta janela de pré-visualização. Abra o app em uma aba própria para autorizar.'
                : 'As notificações estão bloqueadas nas permissões do site. Clique no ícone de cadeado ao lado da URL para permitir notificações.'}
            </span>
          </div>
          {inIframe && (
            <a
              href={currentHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#FECDD3] text-[#BE123C] font-bold text-[11px] shrink-0 whitespace-nowrap hover:bg-rose-50"
            >
              <span>Abrir em nova aba</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {statusMsg && (
        <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] text-xs font-semibold flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs font-semibold flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {supported && permission !== 'denied' && (
        <div className="pt-3 border-t border-[#E8E2D9] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
              <Clock className="w-4 h-4 text-[#0D9488]" />
              <span>Horário do lembrete diário:</span>
            </label>
            <input
              type="time"
              value={timeString}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#E8E2D9] text-xs font-bold text-[#1C1917] focus:outline-none focus:border-[#0D9488]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleTestPush(0)}
              className="tactile-btn py-2.5 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F0EA] disabled:opacity-60 border border-[#E8E2D9] border-b-[3px] border-b-[#D6CFC5] text-[#1C1917] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Enviar Ameaça da Libi agora</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleTestPush(10)}
              className="tactile-btn py-2.5 px-3 rounded-xl bg-[#FFF1E6] hover:bg-[#FFEDD5] disabled:opacity-60 border border-[#FED7AA] border-b-[3px] border-b-[#EA580C] text-[#9A3412] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>Testar em 10s</span>
            </button>
          </div>
          <p className="text-[11px] text-[#78716C] font-medium">
            Às {timeString} (e após 24h, 48h ou 72h sem abrir o app), a Libi envia um lembrete automático para proteger sua ofensiva.
          </p>
        </div>
      )}
    </div>
  );
};
