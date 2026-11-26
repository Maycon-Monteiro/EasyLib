import React, { useState } from 'react';
import { CheckCircle2, Download, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundService } from '../services/soundService';
import { EASYLIB_APP_COVER, EASYLIB_APP_ICON } from '../data/brandMedia';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (compact) {
      return (
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F0FDFA] border border-[#99F6E4]">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[#FBF6EF] border border-[#E8E2D9] p-0.5">
            <img
              src={EASYLIB_APP_ICON}
              alt="Logo EasyLib"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-[#0F766E] truncate">App Instalado</div>
            <div className="text-[10px] font-medium text-[#115E59] truncate">Pronto para uso offline</div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#99F6E4] bg-[#0D9488] text-white">
        <img
          src={EASYLIB_APP_COVER}
          alt="Capa oficial do aplicativo EasyLib instalado"
          referrerPolicy="no-referrer"
          className="w-full h-36 sm:h-44 object-cover object-right opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B6D65] via-[#0D9488]/90 to-transparent" />
        <div className="relative sm:absolute sm:inset-0 p-4 sm:p-5 flex items-center gap-3.5 bg-[#0D9488] sm:bg-transparent">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/60 shadow-md shrink-0 bg-[#FBF6EF] p-0.5">
            <img
              src={EASYLIB_APP_ICON}
              alt="Logo oficial EasyLib"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 space-y-1 max-w-md">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#CCFBF1]">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>EasyLib Instalado</span>
            </span>
            <h3 className="font-display text-lg font-bold leading-snug">
              Bem-vindo ao app no seu dispositivo
            </h3>
            <p className="text-xs text-white/95 font-medium leading-relaxed text-justify">
              Você está acessando a versão instalada com abertura em tela cheia e acesso rápido à sua trilha de Libras.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!canInstall && !isIOS) return null;

  if (isIOS) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            setShowIOSGuide((v) => !v);
          }}
          className={`tactile-btn w-full flex items-center justify-center gap-2 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] border-b-[3px] border-b-[#0D9488] font-bold text-xs cursor-pointer ${
            compact ? 'px-3 py-2' : 'px-4 py-2.5'
          }`}
        >
          <Share className="w-4 h-4 shrink-0" />
          <span>Instalar App</span>
        </button>

        {showIOSGuide && (
          <div className="p-2.5 rounded-xl bg-white border border-[#E8E2D9] text-[11px] text-[#57534E] font-medium leading-snug text-justify">
            No Safari, toque em <strong>Compartilhar</strong> e depois em{' '}
            <strong>Adicionar à Tela de Início</strong>.
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        soundService.playTap();
        promptInstall();
      }}
      className={`tactile-btn w-full flex items-center justify-center gap-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white border-b-[3px] border-[#115E59] font-bold text-xs cursor-pointer ${
        compact ? 'px-3 py-2' : 'px-4 py-2.5'
      }`}
    >
      <Download className="w-4 h-4 shrink-0" />
      <span>Instalar EasyLib</span>
    </button>
  );
};
