import React, { useMemo, useState } from 'react';
import { X, Video, Camera, CheckCircle2, Zap, Sparkles, Coins } from 'lucide-react';
import {
  evaluateSectionSummaryText,
  SectionVideoSummarySpec
} from '../data/librasData';
import { findCatalogSign } from '../data/librasCatalog255';
import { getYouTubeEmbedUrl, parseSignMedia } from '../utils/mediaUtils';
import { SignSchematicVisualizer } from './SignSchematicVisualizer';
import { PracticeCamera } from './PracticeCamera';
import { soundService } from '../services/soundService';

interface SectionSummaryModalProps {
  spec: SectionVideoSummarySpec;
  isCompleted: boolean;
  onClose: () => void;
  onCompleteSummary: (sectionNumber: number, xpReward: number, gemsReward: number) => void;
}

export const SectionSummaryModal: React.FC<SectionSummaryModalProps> = ({
  spec,
  isCompleted,
  onClose,
  onCompleteSummary
}) => {
  const [summaryText, setSummaryText] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeSignIdx, setActiveSignIdx] = useState(0);
  const [copiedCameraCount, setCopiedCameraCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const learnedSigns = useMemo(
    () =>
      spec.learnedSignSlugs
        .map((slug) => findCatalogSign(slug))
        .filter((s): s is NonNullable<typeof s> => Boolean(s)),
    [spec.learnedSignSlugs]
  );

  const activeSign = learnedSigns[activeSignIdx] || learnedSigns[0];
  const parsedVideo = parseSignMedia(spec.videoUrl);
  const validation = useMemo(
    () => evaluateSectionSummaryText(summaryText, spec),
    [summaryText, spec]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.valid) return;
    soundService.playCorrect();
    setSubmitted(true);
    onCompleteSummary(spec.sectionNumber, spec.xpReward, spec.gemsReward);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E8E2D9] w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl animate-fade-in">
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E8E2D9] px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0D9488] flex items-center justify-center shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-base sm:text-lg text-[#1C1917] truncate">
                {spec.title}
              </h2>
              <p className="text-xs text-[#57534E] truncate">{spec.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              onClose();
            }}
            aria-label="Fechar resumo da seção"
            className="p-2 rounded-xl hover:bg-[#F3F0EA] text-[#78716C] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Video Stage */}
          <div className="space-y-1.5">
            {parsedVideo ? (
              <div className="w-full rounded-2xl overflow-hidden bg-stone-950 border border-[#E8E2D9] flex items-center justify-center">
                {parsedVideo.kind === 'youtube' && parsedVideo.videoId ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={getYouTubeEmbedUrl(parsedVideo.videoId, {
                        autoplay: true,
                        mute: true,
                        loop: true,
                        controls: true
                      })}
                      title={spec.title}
                      loading="lazy"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : parsedVideo.kind === 'image' ? (
                  <img
                    src={parsedVideo.url}
                    alt={spec.title}
                    loading="lazy"
                    className="max-h-[420px] w-full object-contain bg-white"
                  />
                ) : (
                  <video
                    src={parsedVideo.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    preload="metadata"
                    className="max-h-[440px] w-auto max-w-full object-contain block"
                  />
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] p-4 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#0F766E]">
                    Prévia dos sinais aprendidos nesta seção ({spec.videoKey})
                  </span>
                  <span className="text-[11px] font-semibold text-[#57534E]">
                    Aguardando URL do vídeo em <code className="font-mono">URLS_VIDEOS_SECAO.{spec.videoKey}</code>
                  </span>
                </div>
                {activeSign && (
                  <SignSchematicVisualizer
                    sign={activeSign}
                    compact={true}
                    showCredit={false}
                    className="max-w-sm mx-auto"
                  />
                )}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {learnedSigns.map((s, idx) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        soundService.playTap();
                        setActiveSignIdx(idx);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        idx === activeSignIdx
                          ? 'bg-[#0D9488] text-white'
                          : 'bg-white border border-[#99F6E4] text-[#0F766E] hover:bg-[#CCFBF1]'
                      }`}
                    >
                      {s.palavra}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Optional Camera Imitation Toggle */}
          {activeSign && (
            <div className="rounded-2xl border border-[#E8E2D9] bg-[#FAF9F6] p-4 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-bold text-sm text-[#1C1917]">
                    Copiar sinais do vídeo na câmera (opcional)
                  </h3>
                  <p className="text-xs text-[#57534E] text-justify">
                    Pratique executando os sinais de <strong>{activeSign.palavra}</strong> para fixar o movimento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundService.playTap();
                    setCameraOpen((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#E8E2D9] hover:border-[#0D9488] text-xs font-bold text-[#0F766E] cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{cameraOpen ? 'Fechar câmera' : 'Copiar na câmera'}</span>
                </button>
              </div>

              {copiedCameraCount > 0 && (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{copiedCameraCount} sinal(is) praticado(s) nesta revisão!</span>
                </div>
              )}

              {cameraOpen && (
                <PracticeCamera
                  targetSign={activeSign}
                  onPassed={() => {
                    setCopiedCameraCount((c) => c + 1);
                    setActiveSignIdx((idx) => (idx + 1) % Math.max(1, learnedSigns.length));
                  }}
                />
              )}
            </div>
          )}

          {/* Written Summary Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="section-summary-textarea"
                className="font-display font-bold text-sm sm:text-base text-[#1C1917]"
              >
                Escreva um breve resumo do vídeo
              </label>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#EA580C] bg-[#FFF1E6] px-2.5 py-1 rounded-lg">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>+{spec.xpReward} XP</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-1 rounded-lg">
                  <Coins className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>+{spec.gemsReward}</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-[#57534E] leading-relaxed text-justify">{spec.promptSummaryHint}</p>

            <textarea
              id="section-summary-textarea"
              rows={3}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Ex.: No vídeo observei os sinais de oi, bom dia, boa tarde e boa noite..."
              className="w-full rounded-2xl border-2 border-[#E8E2D9] focus:border-[#0D9488] outline-none p-3.5 text-sm text-[#1C1917] bg-[#FAF9F6] resize-y"
            />

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className={validation.valid ? 'text-[#0F766E] font-semibold' : 'text-[#78716C]'}>
                {validation.feedback}
              </span>
              <span className="tabular-nums font-bold text-[#57534E] shrink-0">
                {validation.wordCount} palavras
              </span>
            </div>

            {submitted || isCompleted ? (
              <div className="rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#0F766E] font-bold text-sm">
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {submitted
                      ? `Resumo salvo! +${spec.xpReward} XP e +${spec.gemsReward} moedas adicionados.`
                      : 'Resumo desta seção já concluído!'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#0D9488] text-white font-bold text-xs cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={!validation.valid}
                className="tactile-btn w-full py-3 rounded-2xl bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-45 text-white font-bold text-sm uppercase tracking-wider border-b-4 border-[#115E59] cursor-pointer disabled:cursor-not-allowed"
              >
                Enviar resumo e ganhar +{spec.xpReward} XP e +{spec.gemsReward} moedas
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
