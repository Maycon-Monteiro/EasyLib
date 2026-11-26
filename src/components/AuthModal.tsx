import React, { useState } from 'react';
import { X, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import {
  auth,
  formatFirebaseAuthError,
  googleProvider,
  signInWithPopup,
  signInWithRedirect
} from '../firebase';
import { soundService } from '../services/soundService';
import { EASYLIB_APP_ICON } from '../data/brandMedia';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

const POPUP_FALLBACK_CODES = new Set([
  'auth/popup-blocked',
  'auth/operation-not-supported-in-this-environment',
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request'
]);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [showRedirectOption, setShowRedirectOption] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);

  if (!isOpen) return null;

  const currentHost =
    typeof window !== 'undefined' && window.location?.hostname
      ? window.location.hostname
      : '';

  const handleGoogleSignIn = async () => {
    soundService.playTap();
    setErrorMsg(null);
    setErrorCode(null);
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      soundService.playCorrect();
      onAuthSuccess?.();
      onClose();
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: unknown }).code || '')
          : '';
      console.error('[EasyLib Auth] Popup login error:', code || err);
      soundService.playIncorrect();
      setErrorCode(code || null);
      setErrorMsg(formatFirebaseAuthError(err));
      if (POPUP_FALLBACK_CODES.has(code)) {
        setShowRedirectOption(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleRedirect = async () => {
    soundService.playTap();
    setErrorMsg(null);
    setErrorCode(null);
    setBusy(true);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      const code =
        err && typeof err === 'object' && 'code' in err
          ? String((err as { code?: unknown }).code || '')
          : '';
      console.error('[EasyLib Auth] Redirect login error:', code || err);
      soundService.playIncorrect();
      setErrorCode(code || null);
      setErrorMsg(formatFirebaseAuthError(err));
      setBusy(false);
    }
  };

  const handleCopyHost = () => {
    if (!currentHost || typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(currentHost).then(() => {
      setCopiedHost(true);
      setTimeout(() => setCopiedHost(false), 2000);
    }).catch(() => undefined);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#FAF9F6] rounded-3xl border border-[#E8E2D9] p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative animate-scale-in">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar janela de login"
          className="absolute top-4 right-4 p-1.5 rounded-full text-[#78716C] hover:text-[#1C1917] hover:bg-[#E8E2D9]/60 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2 pr-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FBF6EF] border border-[#E8E2D9] border-b-[3px] border-b-[#D6CFC5] p-0.5 shrink-0">
              <img
                src={EASYLIB_APP_ICON}
                alt="Logo EasyLib"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] block">
                Conta EasyLib
              </span>
              <h2 className="font-display text-2xl font-bold text-[#1C1917] leading-tight">
                Entrar com Google
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#57534E] font-medium text-justify">
            Salve sua ofensiva, sinais aprendidos, ranking e progresso na nuvem de forma rápida e segura.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs font-semibold space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-words">{errorMsg}</span>
            </div>

            {errorCode === 'auth/unauthorized-domain' && currentHost && (
              <div className="pt-1.5 border-t border-[#FECDD3]/80 flex items-center justify-between gap-2 text-[11px] text-[#9F1239]">
                <span className="font-mono truncate">{currentHost}</span>
                <button
                  type="button"
                  onClick={handleCopyHost}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-[#FECDD3] font-bold shrink-0 cursor-pointer hover:bg-[#FFF5F5]"
                >
                  {copiedHost ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHost ? 'Copiado' : 'Copiar domínio'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleSignIn}
            className="tactile-btn w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#FAF9F6] border border-[#E8E2D9] border-b-4 border-b-[#D6CFC5] text-[#1C1917] font-bold text-sm sm:text-base flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 shadow-xs"
          >
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z" />
            </svg>
            <span>{busy ? 'Conectando...' : 'Continuar com Google'}</span>
          </button>

          {showRedirectOption && (
            <button
              type="button"
              disabled={busy}
              onClick={handleGoogleRedirect}
              className="w-full py-2.5 px-4 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] text-[#0F766E] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Pop-up bloqueado? Entrar na mesma aba</span>
            </button>
          )}
        </div>

        <div className="text-center">
          <span className="text-[11px] font-semibold text-[#78716C]">
            Acesso autenticado com Google Firebase Auth & Firestore
          </span>
        </div>
      </div>
    </div>
  );
};
