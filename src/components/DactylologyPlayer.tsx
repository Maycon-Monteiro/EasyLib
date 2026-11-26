import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Play, Pause, Gauge } from 'lucide-react';
import { resolveAlphabetMediaUrl, TargetHandshapeId } from '../data/librasCatalog255';
import { renderHandVector } from './SignSchematicVisualizer';
import { soundService } from '../services/soundService';
import { getYouTubeEmbedUrl, parseSignMedia } from '../utils/mediaUtils';

interface DactylologyStep {
  baseLetter: string;
  diacritic?: 'tilde' | 'acute' | 'circumflex' | 'cedilla';
  handshapeId: TargetHandshapeId;
  motionCue?: 'shake_tilde' | 'arc_j' | 'flick_accent' | 'draw_z' | 'rotate_h';
  labelHint: string;
  mediaUrl?: string;
}

const LETTER_SPEC: Record<string, { hs: TargetHandshapeId; motionCue?: DactylologyStep['motionCue'] }> = {
  A: { hs: 'thumb_a' },
  B: { hs: 'flat_b' },
  C: { hs: 'c_shape' },
  Ç: { hs: 'c_shape', motionCue: 'shake_tilde' },
  D: { hs: 'point_1' },
  E: { hs: 'fist_s' },
  F: { hs: 'f_shape' },
  G: { hs: 'point_1' },
  H: { hs: 'k_shape', motionCue: 'rotate_h' },
  I: { hs: 'pinky_i' },
  J: { hs: 'pinky_i', motionCue: 'arc_j' },
  K: { hs: 'k_shape' },
  L: { hs: 'l_shape' },
  M: { hs: 'three_3' },
  N: { hs: 'u_2' },
  O: { hs: 'o_pinch' },
  P: { hs: 'k_shape' },
  Q: { hs: 'point_1' },
  R: { hs: 'r_shape' },
  S: { hs: 'fist_s' },
  T: { hs: 'f_shape' },
  U: { hs: 'u_2' },
  V: { hs: 'v_2' },
  W: { hs: 'three_3' },
  X: { hs: 'point_1', motionCue: 'flick_accent' },
  Y: { hs: 'y_shape' },
  Z: { hs: 'point_1', motionCue: 'draw_z' }
};

// Media type detection handled via parseSignMedia in utils/mediaUtils.ts

function parseDactylologyWord(word: string): DactylologyStep[] {
  const chars = word.trim().toUpperCase().split('');
  return chars
    .filter((ch) => /[A-ZÇÁÉÍÓÚÂÊÔÃÕ]/.test(ch))
    .map((ch) => {
      let base = ch;
      let diacritic: DactylologyStep['diacritic'];
      if (ch === 'Ç') {
        base = 'Ç';
        diacritic = 'cedilla';
      } else if ('ÃÕ'.includes(ch)) {
        base = ch === 'Ã' ? 'A' : 'O';
        diacritic = 'tilde';
      } else if ('ÁÉÍÓÚ'.includes(ch)) {
        base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        diacritic = 'acute';
      } else if ('ÂÊÔ'.includes(ch)) {
        base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        diacritic = 'circumflex';
      }
      const spec = LETTER_SPEC[base] || { hs: 'open_5' as TargetHandshapeId };
      return {
        baseLetter: base,
        diacritic,
        handshapeId: spec.hs,
        motionCue: spec.motionCue ?? (diacritic === 'tilde' ? 'shake_tilde' : diacritic ? 'flick_accent' : undefined),
        mediaUrl: resolveAlphabetMediaUrl(base),
        labelHint:
          diacritic === 'cedilla'
            ? 'Vibração / tremor lateral (Ç)'
            : diacritic === 'tilde'
            ? 'Oscilação ondulada (til ~)'
            : diacritic === 'acute'
            ? 'Movimento rápido para cima (acento agudo)'
            : diacritic === 'circumflex'
            ? 'Movimento em arco fechado (circunflexo)'
            : spec.motionCue === 'arc_j'
            ? 'Curva descendente no ar'
            : spec.motionCue === 'draw_z'
            ? 'Traço em zigue-zague no espaço'
            : spec.motionCue === 'rotate_h'
            ? 'Rotação suave do punho'
            : 'Configuração manual estática'
      };
    });
}

interface DactylologyPlayerProps {
  word: string;
  className?: string;
  revealFullCard?: boolean;
}

function getHandCropLayout(letter: string): { boxWidthClass: string; imgAlignClass: string } {
  const upper = (letter || '').toUpperCase();
  if (upper === 'G' || upper === 'H' || upper === 'M') {
    return { boxWidthClass: 'w-40', imgAlignClass: 'left-0' };
  }
  if (upper === 'R') {
    return { boxWidthClass: 'w-32', imgAlignClass: 'right-0' };
  }
  if (upper === 'A' || upper === 'Q') {
    return { boxWidthClass: 'w-40', imgAlignClass: 'right-0' };
  }
  if (upper === 'P' || upper === 'X') {
    return { boxWidthClass: 'w-48', imgAlignClass: 'right-0' };
  }
  return { boxWidthClass: 'w-44', imgAlignClass: 'right-0' };
}

let cachedDiscoveredAlphabet: Record<string, string> | null = null;
let alphabetDiscoveryPromise: Promise<Record<string, string>> | null = null;

function fetchDiscoveredAlphabetMedia(): Promise<Record<string, string>> {
  if (cachedDiscoveredAlphabet) return Promise.resolve(cachedDiscoveredAlphabet);
  if (!alphabetDiscoveryPromise) {
    alphabetDiscoveryPromise = fetch('/api/alphabet-media')
      .then((res) => (res.ok ? res.json() : { files: {} }))
      .then((data: { files?: Record<string, string> }) => {
        cachedDiscoveredAlphabet = data?.files || {};
        return cachedDiscoveredAlphabet;
      })
      .catch(() => {
        cachedDiscoveredAlphabet = {};
        return {};
      });
  }
  return alphabetDiscoveryPromise;
}

export const DactylologyPlayer = ({
  word,
  className = '',
  revealFullCard = false
}: DactylologyPlayerProps) => {
  const steps = parseDactylologyWord(word);
  const [stepIdx, setStepIdx] = useState(0);
  const [speed, setSpeed] = useState<1 | 0.5>(1);
  const [paused, setPaused] = useState(false);
  const [failedMediaUrls, setFailedMediaUrls] = useState<Record<string, boolean>>({});
  const [discoveredUrls, setDiscoveredUrls] = useState<Record<string, string>>(
    () => cachedDiscoveredAlphabet || {}
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDiscoveredAlphabetMedia().then((files) => {
      if (!cancelled && files && Object.keys(files).length > 0) {
        setDiscoveredUrls(files);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setStepIdx(0);
    setPaused(false);
  }, [word]);

  const currentStep = steps[stepIdx] || steps[0];
  const candidateUrl = currentStep
    ? currentStep.mediaUrl || discoveredUrls[currentStep.baseLetter]
    : undefined;
  const activeMediaUrl =
    candidateUrl && !failedMediaUrls[candidateUrl]
      ? candidateUrl
      : undefined;

  useEffect(() => {
    if (paused || steps.length <= 1) return;
    const baseInterval = activeMediaUrl ? 1650 : 1050;
    const intervalMs = speed === 0.5 ? Math.round(baseInterval * 1.75) : baseInterval;
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % steps.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, speed, steps.length, activeMediaUrl]);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = speed;
    if (paused) {
      vid.pause();
    } else {
      vid.play().catch(() => undefined);
    }
  }, [speed, paused, stepIdx, activeMediaUrl]);

  if (!currentStep) return null;

  const isRotatedDown =
    currentStep.baseLetter === 'M' ||
    currentStep.baseLetter === 'N' ||
    currentStep.baseLetter === 'P' ||
    currentStep.baseLetter === 'Q';

  const motionOffset =
    currentStep.motionCue === 'shake_tilde'
      ? 'animate-bounce'
      : currentStep.motionCue === 'draw_z' || currentStep.motionCue === 'rotate_h'
      ? 'animate-pulse'
      : '';

  return (
    <div className={`rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#0F766E]">
        <span>
          Soletração manual · Letra {stepIdx + 1} de {steps.length}
        </span>
        {currentStep.diacritic || currentStep.motionCue ? (
          <span className="text-[11px] font-semibold text-[#EA580C]">
            {currentStep.labelHint}
          </span>
        ) : null}
      </div>

      {/* Sequential Handshape / Alphabet Video Stage */}
      <div className="relative flex flex-col items-center justify-center bg-white rounded-2xl border border-[#CCFBF1] overflow-hidden">
        {(() => {
          const parsedMedia = activeMediaUrl ? parseSignMedia(activeMediaUrl) : null;
          if (!parsedMedia) {
            return (
              <div className="w-full aspect-video flex items-center justify-center bg-white">
                <svg
                  viewBox="-55 -48 110 92"
                  className={`w-40 h-32 select-none ${motionOffset}`}
                  role="img"
                  aria-label={`Sinal da letra ${stepIdx + 1} da datilologia`}
                >
                  <g transform={isRotatedDown ? 'rotate(180)' : undefined}>
                    {renderHandVector(currentStep.handshapeId)}
                  </g>
                </svg>
              </div>
            );
          }

          if (parsedMedia.kind === 'youtube' && parsedMedia.videoId) {
            return (
              <div className="w-full aspect-video overflow-hidden bg-stone-950">
                <iframe
                  key={`${parsedMedia.videoId}-${stepIdx}`}
                  src={getYouTubeEmbedUrl(parsedMedia.videoId, {
                    autoplay: !paused,
                    mute: true,
                    loop: true,
                    controls: false
                  })}
                  title={`Letra ${stepIdx + 1} em Libras`}
                  loading="lazy"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  className="w-full h-full border-0 block pointer-events-none"
                />
              </div>
            );
          }

          if (parsedMedia.kind === 'video') {
            return (
              <div className="w-full min-h-[180px] max-h-[340px] overflow-hidden bg-stone-950 flex items-center justify-center">
                <video
                  ref={videoRef}
                  key={`${parsedMedia.url}-${stepIdx}`}
                  src={parsedMedia.url}
                  autoPlay={!paused}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={() =>
                    setFailedMediaUrls((prev) => ({ ...prev, [parsedMedia.url]: true }))
                  }
                  className="max-h-[340px] w-auto max-w-full object-contain block"
                />
              </div>
            );
          }

          if (revealFullCard) {
            return (
              <div className="w-full min-h-[180px] max-h-[280px] overflow-hidden bg-white flex items-center justify-center p-2">
                <img
                  src={parsedMedia.url}
                  alt={`Sinal da letra ${currentStep.baseLetter} da datilologia`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedMediaUrls((prev) => ({ ...prev, [parsedMedia.url]: true }))
                  }
                  className="max-h-[260px] w-auto max-w-full object-contain block select-none"
                />
              </div>
            );
          }

          const crop = getHandCropLayout(currentStep.baseLetter);
          return (
            <div className="w-full py-2 bg-white flex items-center justify-center">
              <div className={`relative ${crop.boxWidthClass} h-56 overflow-hidden rounded-xl bg-white ${motionOffset}`}>
                <img
                  src={parsedMedia.url}
                  alt={`Sinal da letra ${stepIdx + 1} da datilologia`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() =>
                    setFailedMediaUrls((prev) => ({ ...prev, [parsedMedia.url]: true }))
                  }
                  className={`absolute top-1/2 -translate-y-1/2 h-[108%] w-auto max-w-none select-none pointer-events-none ${crop.imgAlignClass}`}
                />
              </div>
            </div>
          );
        })()}

        {/* Sequence Step Dots (Click any step to inspect) */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 py-2.5 px-3 w-full border-t border-[#CCFBF1] bg-[#F0FDFA]/60">
          {steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                soundService.playTap();
                setStepIdx(idx);
              }}
              aria-label={`Ver letra ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                idx === stepIdx
                  ? 'w-7 bg-[#EA580C]'
                  : idx < stepIdx
                  ? 'w-2.5 bg-[#0D9488]'
                  : 'w-2.5 bg-[#D6CFC5]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Playback Controls: Repetir, Pausar, 1x / 0.5x */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              setStepIdx(0);
              setPaused(false);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#99F6E4] text-[#0F766E] hover:bg-[#CCFBF1] font-bold text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Repetir</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              setPaused((p) => !p);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-[#99F6E4] text-[#0F766E] hover:bg-[#CCFBF1] font-bold text-xs cursor-pointer"
          >
            {paused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{paused ? 'Continuar' : 'Pausar'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#99F6E4]">
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              setSpeed(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              speed === 1 ? 'bg-[#0D9488] text-white' : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            1x
          </button>
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              setSpeed(speed === 0.5 ? 1 : 0.5);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 ${
              speed === 0.5 ? 'bg-[#EA580C] text-white' : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>0.5x</span>
          </button>
        </div>
      </div>
    </div>
  );
};
