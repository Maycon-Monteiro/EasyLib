import React, { useEffect, useState } from 'react';
import { soundService } from '../services/soundService';

export type LibiPose =
  | 'acenando'
  | 'ensinando'
  | 'comemorando'
  | 'pensando'
  | 'incentivando'
  | 'lendo'
  | 'eu_te_amo'
  | 'treinando'
  | 'campeao'
  | 'curioso';

export type LibiMood =
  | LibiPose
  | 'idle'
  | 'happy'
  | 'dancing'
  | 'crying'
  | 'cheering'
  | 'thinking'
  | 'shocked'
  | 'super'
  | 'winking'
  | 'signing_ily'
  | 'visual_applause';

interface LibiMascotProps {
  mood?: LibiMood;
  outfit?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  speechText?: string;
  bubblePosition?: 'top' | 'side';
  onClick?: () => void;
  className?: string;
}

const POSE_ASSETS: Record<LibiPose, { src: string; alt: string }> = {
  acenando: {
    src: '/mascote/acenando.png',
    alt: 'Libi acenando com boas-vindas'
  },
  ensinando: {
    src: '/mascote/ensinando.png',
    alt: 'Libi fazendo um sinal em Libras'
  },
  comemorando: {
    src: '/mascote/comemorando.png',
    alt: 'Libi comemorando seu acerto'
  },
  pensando: {
    src: '/mascote/pensando.png',
    alt: 'Libi pensando na melhor dica'
  },
  incentivando: {
    src: '/mascote/incentivando.png',
    alt: 'Libi incentivando você a continuar'
  },
  lendo: {
    src: '/mascote/lendo.png',
    alt: 'Libi lendo o guia ilustrado de Libras'
  },
  eu_te_amo: {
    src: '/mascote/eu-te-amo.png',
    alt: 'Libi fazendo o sinal de Eu Te Amo em Libras'
  },
  treinando: {
    src: '/mascote/treinando.png',
    alt: 'Libi treinando sinais com faixa esportiva'
  },
  campeao: {
    src: '/mascote/campeao.png',
    alt: 'Libi segurando um troféu de conquista'
  },
  curioso: {
    src: '/mascote/curioso.png',
    alt: 'Libi explorando sinais com uma lupa'
  }
};

function resolvePose(mood: LibiMood): LibiPose {
  switch (mood) {
    case 'acenando':
    case 'idle':
    case 'happy':
    case 'winking':
      return 'acenando';
    case 'ensinando':
      return 'ensinando';
    case 'eu_te_amo':
    case 'signing_ily':
      return 'eu_te_amo';
    case 'lendo':
      return 'lendo';
    case 'treinando':
      return 'treinando';
    case 'campeao':
    case 'super':
      return 'campeao';
    case 'curioso':
      return 'curioso';
    case 'comemorando':
    case 'visual_applause':
    case 'cheering':
    case 'dancing':
      return 'comemorando';
    case 'pensando':
    case 'thinking':
      return 'pensando';
    case 'incentivando':
    case 'crying':
    case 'shocked':
      return 'incentivando';
    default:
      return 'acenando';
  }
}

function renderOutfitOverlay(outfit: string) {
  switch (outfit) {
    case 'formal':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <path d="M 38 69 L 50 77 L 62 69 L 58 76 L 50 72 L 42 76 Z" fill="#FFFFFF" stroke="#1C1917" strokeWidth="1.5" />
          <path d="M 47 73 L 53 73 L 55 88 L 50 94 L 45 88 Z" fill="#BE123C" stroke="#881337" strokeWidth="1.2" />
          <rect x="46" y="71" width="8" height="5" rx="1.5" fill="#9F1239" />
        </svg>
      );
    case 'sport':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <rect x="24" y="18" width="52" height="10" rx="5" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="50" cy="23" r="3" fill="#FBBF24" />
        </svg>
      );
    case 'scholar':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <polygon points="50,2 78,12 50,21 22,12" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.3" />
          <line x1="74" y1="13" x2="77" y2="26" stroke="#F59E0B" strokeWidth="1.8" />
          <circle cx="40" cy="40" r="8" fill="none" stroke="#1E293B" strokeWidth="2.2" />
          <circle cx="60" cy="40" r="8" fill="none" stroke="#1E293B" strokeWidth="2.2" />
          <line x1="48" y1="40" x2="52" y2="40" stroke="#1E293B" strokeWidth="2.2" />
        </svg>
      );
    case 'explorer':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <ellipse cx="50" cy="17" rx="34" ry="7" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <path d="M 31 16 C 33 5, 67 5, 69 16 Z" fill="#F59E0B" stroke="#92400E" strokeWidth="1.5" />
          <path d="M 36 69 L 50 82 L 64 69 L 50 75 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="1.2" />
        </svg>
      );
    case 'comunidade':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <path d="M 28 70 Q 50 84 72 70 L 68 80 Q 50 91 32 80 Z" fill="#0284C7" stroke="#E0F2FE" strokeWidth="1.4" />
          <circle cx="50" cy="80" r="4.5" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="1.2" />
        </svg>
      );
    case 'superduo':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <path d="M 24 62 L 12 94 L 38 86 Z" fill="#0D9488" stroke="#115E59" strokeWidth="1.3" />
          <path d="M 76 62 L 88 94 L 62 86 Z" fill="#0D9488" stroke="#115E59" strokeWidth="1.3" />
          <polygon points="50,70 57,78 50,89 43,78" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.4" />
        </svg>
      );
    case 'gold':
      return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
          <polygon points="30,19 35,4 44,13 50,2 56,13 65,4 70,19" fill="#FBBF24" stroke="#B45309" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="50" cy="14" r="2.2" fill="#E11D48" />
        </svg>
      );
    case 'classic':
    default:
      return null;
  }
}

export const LibiMascot = ({
  mood = 'acenando',
  outfit = 'classic',
  size = 'md',
  showSpeechBubble = false,
  speechText,
  bubblePosition = 'top',
  onClick,
  className = ''
}: LibiMascotProps) => {
  const [imgFailed, setImgFailed] = useState(false);

  const pose = resolvePose(mood);
  const asset = POSE_ASSETS[pose];

  useEffect(() => {
    setImgFailed(false);
  }, [asset.src]);

  const sizeStyles: Record<NonNullable<LibiMascotProps['size']>, string> = {
    xs: 'w-14 h-14',
    sm: 'w-20 h-20',
    md: 'w-28 h-28',
    lg: 'w-36 h-36',
    xl: 'w-44 h-44'
  };

  const handleInteraction = () => {
    if (!onClick) return;
    soundService.playTap();
    onClick();
  };

  return (
    <div
      className={`relative inline-flex ${
        bubblePosition === 'side' ? 'flex-row items-center gap-3' : 'flex-col items-center'
      } select-none ${className}`}
    >
      {showSpeechBubble && speechText && bubblePosition === 'top' && (
        <div className="mb-1.5 z-20 whitespace-nowrap bg-white text-[#1C1917] font-bold text-xs px-3 py-1.5 rounded-xl border border-[#E8E2D9] shadow-sm relative">
          <span>{speechText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-[#E8E2D9] rotate-45" />
        </div>
      )}

      <div
        onClick={handleInteraction}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleInteraction();
                }
              }
            : undefined
        }
        className={`relative flex items-center justify-center shrink-0 transition-transform duration-150 ${sizeStyles[size]} ${
          onClick ? 'cursor-pointer hover:scale-[1.03] active:scale-95' : ''
        }`}
      >
        {!imgFailed ? (
          <>
            <img
              key={asset.src}
              src={asset.src}
              alt={asset.alt}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
            {renderOutfitOverlay(outfit)}
          </>
        ) : (
          <div className="w-full h-full rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0F766E] font-display font-bold text-sm">
            Libi
          </div>
        )}
      </div>

      {showSpeechBubble && speechText && bubblePosition === 'side' && (
        <div className="bg-white text-[#1C1917] font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-[#E8E2D9] relative leading-snug">
          <div className="hidden sm:block absolute top-1/2 -left-1.5 -translate-y-1/2 w-2.5 h-2.5 bg-white border-l border-b border-[#E8E2D9] rotate-45" />
          <span>{speechText}</span>
        </div>
      )}
    </div>
  );
};
