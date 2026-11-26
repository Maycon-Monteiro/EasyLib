import React, { useEffect, useState } from 'react';
import { Crown } from 'lucide-react';
import {
  getNameTagById,
  getPlayerClassById
} from '../data/customizationCatalog';
import { resolvePresetImageSrc } from '../data/presetImages';
import { NameTagIcon, PlayerClassIcon } from './CatalogIcons';

interface NameTagBadgeProps {
  name: string;
  username?: string;
  nameTagId?: string;
  nameTagImage?: string;
  nameTagSubtitle?: string;
  playerClassId?: string;
  isPlus?: boolean;
  photoUrl?: string | null;
  compact?: boolean;
  className?: string;
}

export function isValidCustomImageSrc(raw?: string): boolean {
  if (!raw) return false;
  return (
    raw.startsWith('data:image/jpeg;base64,') ||
    raw.startsWith('data:image/png;base64,') ||
    raw.startsWith('data:image/webp;base64,')
  );
}

export const NameTagAvatar: React.FC<{
  name: string;
  nameTagImage?: string;
  photoUrl?: string | null;
  accentHex?: string;
  sizeClass?: string;
}> = ({ name, nameTagImage, photoUrl, accentHex = '#0D9488', sizeClass = 'w-11 h-11' }) => {
  const [imgError, setImgError] = useState(false);

  const customImage = isValidCustomImageSrc(nameTagImage) ? nameTagImage : null;
  const presetImage = resolvePresetImageSrc(nameTagImage);
  const resolvedPhoto = customImage || presetImage || photoUrl || null;

  useEffect(() => {
    setImgError(false);
  }, [resolvedPhoto]);

  if (resolvedPhoto && !imgError) {
    return (
      <img
        src={resolvedPhoto}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-2xl object-cover border-2 shrink-0 bg-[#F0FDFA]`}
        style={{ borderColor: accentHex }}
      />
    );
  }

  const parts = (name || 'V').trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : (parts[0] || 'V').slice(0, 2).toUpperCase();

  return (
    <div
      className={`${sizeClass} rounded-2xl flex items-center justify-center font-display font-bold text-white text-sm shrink-0 border-2 border-white/30`}
      style={{ backgroundColor: accentHex }}
    >
      {initials}
    </div>
  );
};

export const NameTagBadge: React.FC<NameTagBadgeProps> = ({
  name,
  username,
  nameTagId,
  nameTagImage,
  nameTagSubtitle,
  playerClassId,
  isPlus = false,
  photoUrl,
  compact = false,
  className = ''
}) => {
  const tag = getNameTagById(nameTagId);
  const playerClass = getPlayerClassById(playerClassId);

  return (
    <div
      className={`rounded-2xl border-2 ${tag.containerClass} ${
        compact ? 'px-3 py-2' : 'p-4'
      } flex items-center justify-between gap-3 transition-all ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <NameTagAvatar
          name={name}
          nameTagImage={nameTagImage}
          photoUrl={photoUrl}
          accentHex={tag.accentHex}
          sizeClass={compact ? 'w-9 h-9' : 'w-12 h-12'}
        />

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`font-display font-bold truncate ${compact ? 'text-sm' : 'text-lg'} ${tag.textColorClass}`}>
              {name}
            </span>
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={{ color: tag.accentHex }}
              aria-hidden="true"
            >
              <NameTagIcon iconId={tag.badgeIcon} className="w-4 h-4" />
            </span>
            {isPlus && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#F59E0B] text-[#1C1917] font-extrabold text-[10px] uppercase tracking-wider shrink-0">
                <Crown className="w-3 h-3" />
                <span>PLUS</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold text-white shrink-0"
              style={{ backgroundColor: playerClass.badgeColorHex }}
            >
              <PlayerClassIcon iconId={playerClass.icon} className="w-3 h-3" />
              <span>{playerClass.name}</span>
            </span>

            {username && (
              <span className={`text-xs font-semibold truncate ${tag.subTextColorClass}`}>
                @{username}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
