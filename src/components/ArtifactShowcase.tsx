import React, { useState } from 'react';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  ArtifactCategory,
  ArtifactIconKind,
  ARTIFACTS_CATALOG,
  CollectibleArtifact,
  isArtifactUnlocked
} from '../data/artifactsData';
import { UserProfile } from '../types';
import { soundService } from '../services/soundService';

export const ArtifactVectorEmblem: React.FC<{
  artifact: CollectibleArtifact;
  unlocked?: boolean;
  size?: 'sm' | 'md';
}> = ({ artifact, unlocked = true, size = 'md' }) => {
  const stroke = unlocked ? artifact.primaryColor : '#94A3B8';
  const accent = unlocked ? artifact.secondaryColor : '#CBD5E1';
  const dim = size === 'sm' ? 'w-11 h-11' : 'w-14 h-14';

  const renderShape = (kind: ArtifactIconKind) => {
    switch (kind) {
      case 'hand_wave':
        return (
          <>
            <path d="M22 36V19a2.5 2.5 0 0 1 5 0v10" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M27 29V15a2.5 2.5 0 0 1 5 0v14" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M32 29V17a2.5 2.5 0 0 1 5 0v15" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M22 31l-4-4a2.4 2.4 0 0 0-3.4 3.4l7.4 8.6a9 9 0 0 0 15-4V30" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill={accent} fillOpacity="0.45" />
          </>
        );
      case 'sunburst':
        return (
          <>
            <circle cx="28" cy="28" r="9" fill={accent} stroke={stroke} strokeWidth="2.8" />
            <path d="M28 11v5M28 40v5M11 28h5M40 28h5M16 16l3.5 3.5M36.5 36.5L40 40M40 16l-3.5 3.5M19.5 36.5L16 40" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
          </>
        );
      case 'moon_star':
        return (
          <>
            <path d="M34 15a13 13 0 1 0 7 23.8A11 11 0 0 1 34 15z" fill={accent} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M38 16l1.5 3.2 3.5.5-2.5 2.4.6 3.4-3.1-1.6-3.1 1.6.6-3.4-2.5-2.4 3.5-.5z" fill={stroke} />
          </>
        );
      case 'heart_ily':
        return (
          <path d="M28 43s-13-8.4-13-17.8a7.4 7.4 0 0 1 13-4.8 7.4 7.4 0 0 1 13 4.8C41 34.6 28 43 28 43z" fill={accent} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        );
      case 'crown':
        return (
          <path d="M13 37l3-16 8 7 4-11 4 11 8-7 3 16z" fill={accent} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        );
      case 'flame':
        return (
          <path d="M29 12c2 7-7 10-7 17a8 8 0 0 0 16 0c0-5-3-9-9-17z" fill={accent} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        );
      case 'shield':
        return (
          <path d="M28 12l13 5v10c0 9-5.5 14.5-13 18-7.5-3.5-13-9-13-18V17z" fill={accent} stroke={stroke} strokeWidth="2.8" strokeLinejoin="round" />
        );
      case 'compass':
        return (
          <>
            <circle cx="28" cy="28" r="14" fill={accent} fillOpacity="0.45" stroke={stroke} strokeWidth="2.6" />
            <polygon points="28,17 32,28 28,39 24,28" fill={stroke} />
          </>
        );
      case 'gem_hex':
      case 'prism':
        return (
          <>
            <polygon points="28,12 41,21 36,41 20,41 15,21" fill={accent} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M15 21h26M28 12l-5 9 5 20 5-20z" stroke={stroke} strokeWidth="2" fill="none" />
          </>
        );
      case 'diamond':
        return (
          <>
            <polygon points="20,15 36,15 43,24 28,43 13,24" fill={accent} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M13 24h30M20 15l8 9 8-9" stroke={stroke} strokeWidth="2" fill="none" />
          </>
        );
      case 'ribbon':
        return (
          <>
            <circle cx="28" cy="23" r="8" fill={accent} stroke={stroke} strokeWidth="2.8" />
            <path d="M23 30l-4 13 9-4 9 4-4-13" fill={accent} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
          </>
        );
      case 'book':
      case 'scroll':
        return (
          <>
            <rect x="15" y="15" width="26" height="26" rx="4" fill={accent} stroke={stroke} strokeWidth="2.6" />
            <path d="M22 22h12M22 28h12M22 34h8" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
          </>
        );
      case 'eye':
        return (
          <>
            <path d="M12 28s6-10 16-10 16 10 16 10-6 10-16 10-16-10-16-10z" fill={accent} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
            <circle cx="28" cy="28" r="5" fill={stroke} />
          </>
        );
      case 'spark':
      case 'badge_star':
        return (
          <path d="M28 11l3.6 10.4L42 25l-10.4 3.6L28 39l-3.6-10.4L14 25l10.4-3.6z" fill={accent} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
        );
      case 'trophy':
        return (
          <>
            <path d="M18 15h20v8a10 10 0 0 1-20 0z" fill={accent} stroke={stroke} strokeWidth="2.6" />
            <path d="M28 33v7M21 40h14M18 18h-4a3 3 0 0 0 0 6h4M38 18h4a3 3 0 0 1 0 6h-4" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        );
      case 'leaf':
      case 'feather':
        return (
          <>
            <path d="M40 15C24 15 15 24 15 40c16 0 25-9 25-25z" fill={accent} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
            <path d="M15 40l17-17" stroke={stroke} strokeWidth="2.4" strokeLinecap="round" />
          </>
        );
      case 'globe':
        return (
          <>
            <circle cx="28" cy="28" r="14" fill={accent} stroke={stroke} strokeWidth="2.6" />
            <ellipse cx="28" cy="28" rx="6" ry="14" fill="none" stroke={stroke} strokeWidth="2.2" />
            <path d="M14 28h28" stroke={stroke} strokeWidth="2.2" />
          </>
        );
      case 'camera':
        return (
          <>
            <rect x="13" y="18" width="30" height="22" rx="5" fill={accent} stroke={stroke} strokeWidth="2.6" />
            <circle cx="28" cy="29" r="6" fill="white" stroke={stroke} strokeWidth="2.6" />
            <path d="M22 18l2-4h8l2 4" stroke={stroke} strokeWidth="2.4" fill="none" strokeLinejoin="round" />
          </>
        );
      case 'bell':
      case 'lantern':
        return (
          <>
            <path d="M19 33v-7a9 9 0 0 1 18 0v7l3 4H16z" fill={accent} stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
            <circle cx="28" cy="40" r="2.5" fill={stroke} />
          </>
        );
      case 'medal':
      case 'laurel':
        return (
          <>
            <circle cx="28" cy="30" r="10" fill={accent} stroke={stroke} strokeWidth="2.6" />
            <path d="M22 14l4 8M34 14l-4 8" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
            <circle cx="28" cy="30" r="4" fill={stroke} />
          </>
        );
      case 'key':
        return (
          <>
            <circle cx="21" cy="28" r="7" fill={accent} stroke={stroke} strokeWidth="2.6" />
            <path d="M28 28h14M37 28v5M41 28v4" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
          </>
        );
      case 'rainbow_arc':
      case 'wave_crest':
        return (
          <>
            <path d="M14 34a14 14 0 0 1 28 0" fill="none" stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M19 34a9 9 0 0 1 18 0" fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="28" cy="34" r="3" fill={stroke} />
          </>
        );
      case 'owl_crest':
      default:
        return (
          <>
            <circle cx="28" cy="28" r="13" fill={accent} stroke={stroke} strokeWidth="2.6" />
            <circle cx="23" cy="26" r="3" fill="white" stroke={stroke} strokeWidth="2" />
            <circle cx="33" cy="26" r="3" fill="white" stroke={stroke} strokeWidth="2" />
            <polygon points="28,29 25,33 31,33" fill={stroke} />
          </>
        );
    }
  };

  return (
    <div
      className={`${dim} rounded-2xl border flex items-center justify-center shrink-0 transition-transform ${
        unlocked ? 'shadow-xs' : 'opacity-60 grayscale'
      }`}
      style={{
        backgroundColor: unlocked ? artifact.bgTint : '#F3F0EA',
        borderColor: unlocked ? `${artifact.primaryColor}40` : '#E8E2D9'
      }}
    >
      <svg viewBox="0 0 56 56" className="w-full h-full p-1" aria-hidden="true">
        {renderShape(artifact.iconKind)}
      </svg>
    </div>
  );
};

interface ArtifactGalleryProps {
  userProfile: UserProfile;
}

const CATEGORIES: Array<'Todos' | ArtifactCategory> = [
  'Todos',
  'Fundamentos',
  'Cultura Surda',
  'Maestria Visual',
  'Ofensiva',
  'Coleção da Libi'
];

const RARITY_STYLES: Record<CollectibleArtifact['rarity'], { label: string; cls: string }> = {
  comum: { label: 'Comum', cls: 'bg-[#F3F0EA] text-[#57534E]' },
  raro: { label: 'Raro', cls: 'bg-[#F0FDFA] text-[#0F766E]' },
  epico: { label: 'Épico', cls: 'bg-[#FFF1E6] text-[#C2410C]' },
  lendario: { label: 'Lendário', cls: 'bg-[#FEF3C7] text-[#B45309]' }
};

export const ArtifactGallery: React.FC<ArtifactGalleryProps> = ({
  userProfile
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | ArtifactCategory>('Todos');

  const unlockedCount = ARTIFACTS_CATALOG.filter((a) =>
    isArtifactUnlocked(a, userProfile)
  ).length;

  const filtered =
    selectedCategory === 'Todos'
      ? ARTIFACTS_CATALOG
      : ARTIFACTS_CATALOG.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#EA580C]" />
          <h3 className="font-display text-lg font-bold text-[#1C1917]">
            Coleção de Artefatos
          </h3>
        </div>
        <span className="text-xs font-bold text-[#0F766E] bg-[#F0FDFA] px-2.5 py-1 rounded-xl border border-[#99F6E4] tabular-nums">
          {unlockedCount} / {ARTIFACTS_CATALOG.length} desbloqueados
        </span>
      </div>

      {/* Category Filter Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => {
              soundService.playTap();
              setSelectedCategory(cat);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-colors ${
              selectedCategory === cat
                ? 'bg-[#0D9488] text-white'
                : 'bg-[#F3F0EA] text-[#57534E] hover:bg-[#E8E2D9]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 30 Artifacts Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((artifact) => {
          const unlocked = isArtifactUnlocked(artifact, userProfile);
          const rarity = RARITY_STYLES[artifact.rarity];

          return (
            <div
              key={artifact.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-colors ${
                unlocked
                  ? 'bg-white border-[#E8E2D9]'
                  : 'bg-[#FAF9F6] border-[#E8E2D9]/80'
              }`}
            >
              <ArtifactVectorEmblem artifact={artifact} unlocked={unlocked} size="md" />

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <h4 className="font-bold text-sm text-[#1C1917] truncate">
                    {artifact.title}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${rarity.cls}`}
                  >
                    {rarity.label}
                  </span>
                </div>

                <p className="text-xs text-[#57534E] leading-snug">{artifact.description}</p>

                <div className="pt-1 flex items-center justify-between gap-2">
                  {unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Na coleção</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#78716C]">
                      <Lock className="w-3 h-3 shrink-0" />
                      <span className="truncate">{artifact.unlockHint}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
