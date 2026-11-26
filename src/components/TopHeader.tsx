import React, { useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  BookmarkCheck,
  Bell,
  Coins,
  Sun,
  Moon,
  Crown,
  Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { LibrasTrack, UserProfile } from '../types';
import { AppTheme } from '../services/themeService';
import { soundService } from '../services/soundService';
import { storageService } from '../services/storage';
import { getNameTagById, getPlayerClassById } from '../data/customizationCatalog';
import { NameTagAvatar } from './NameTagBadge';
import { PlayerClassIcon } from './CatalogIcons';

interface TopHeaderProps {
  userProfile: UserProfile;
  onSelectTrack: (track: LibrasTrack) => void;
  onRefillHearts?: () => void;
  onToggleSuper?: () => void;
  onOpenShop?: () => void;
  onResetData: () => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  firebaseUser?: User | null;
  authBusy?: boolean;
  onOpenAuthModal?: () => void;
  onOpenProfile?: () => void;
}

const WEEK_LABELS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export const TopHeader = ({
  userProfile,
  onOpenShop,
  theme = 'light',
  onToggleTheme,
  firebaseUser,
  authBusy = false,
  onOpenAuthModal,
  onOpenProfile
}: TopHeaderProps) => {
  const [isStreakMenuOpen, setIsStreakMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [avatarImgError, setAvatarImgError] = useState(false);

  const hasLocalProgress = userProfile.xp > 0 || userProfile.completedNodeIds.length > 0;
  const rawName = (
    firebaseUser?.displayName ||
    userProfile.name ||
    firebaseUser?.phoneNumber ||
    'Visitante'
  ).trim();
  const isDefaultGuestName =
    !firebaseUser && (rawName === 'Aprendiz de Libras' || rawName === 'Visitante' || rawName === '');
  const displayFirstName = isDefaultGuestName ? 'Visitante' : rawName.split(/\s+/)[0];
  const photoUrl = firebaseUser?.photoURL && !avatarImgError ? firebaseUser.photoURL : null;

  const activeTag = getNameTagById(userProfile.nameTagId);
  const activeClass = getPlayerClassById(userProfile.playerClassId);

  const toggleSound = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
    soundService.playTap();
  };

  const todayDow = new Date().getDay();
  const practicedToday = storageService.hasPracticedToday();
  const streakCount = Math.max(0, userProfile.streakDays);

  const daysOfWeek = WEEK_LABELS.map((label, idx) => {
    const isToday = idx === todayDow;
    const daysAgo = todayDow - idx;
    let done = false;
    if (daysAgo >= 0 && streakCount > 0) {
      if (practicedToday) {
        done = daysAgo < streakCount;
      } else {
        done = daysAgo >= 1 && daysAgo <= streakCount;
      }
    }
    return { label, done, isToday };
  });

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E8E2D9] px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-3 min-w-0">
        {/* Left: User NameTAG Chip (Avatar + Name + Class + Plus badge) */}
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            setIsStreakMenuOpen(false);
            onOpenProfile?.();
          }}
          title="Abrir perfil e NameTAG"
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl border border-b-[3px] cursor-pointer transition-colors min-w-0 max-w-[185px] sm:max-w-[280px] ${activeTag.containerClass}`}
        >
          {photoUrl && !userProfile.nameTagImage?.startsWith('data:image/') ? (
            <img
              src={photoUrl}
              alt={rawName}
              onError={() => setAvatarImgError(true)}
              className="w-8 h-8 rounded-xl object-cover border shrink-0"
              style={{ borderColor: activeTag.accentHex }}
            />
          ) : (
            <NameTagAvatar
              name={isDefaultGuestName ? 'Visitante' : rawName}
              nameTagImage={userProfile.nameTagImage}
              accentHex={activeTag.accentHex}
              sizeClass="w-8 h-8"
            />
          )}

          <div className="text-left min-w-0">
            <div className={`font-bold text-xs sm:text-sm truncate flex items-center gap-1 ${activeTag.textColorClass}`}>
              <span className="truncate">Olá, {displayFirstName}</span>
              {userProfile.isSuperDuolingo && (
                <Crown className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              )}
            </div>
            <div className={`text-[10px] font-semibold truncate hidden sm:flex items-center gap-1 ${activeTag.subTextColorClass}`}>
              <PlayerClassIcon iconId={activeClass.icon} className="w-3 h-3 shrink-0" />
              <span className="truncate">{activeClass.name}</span>
            </div>
          </div>
        </button>

        {/* Right: Theme Toggle, Notifications, Sound, Streak, Coins & Auth */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Light / Dark Theme Toggle */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                onToggleTheme();
              }}
              className="p-2 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3F0EA] cursor-pointer transition-colors"
              title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Dark (conforto visual)'}
              aria-label={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Dark'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#FBBF24]" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          )}

          {/* Notification Settings Shortcut */}
          <button
            type="button"
            onClick={() => {
              soundService.playTap();
              setIsStreakMenuOpen(false);
              onOpenProfile?.();
            }}
            className="p-2 rounded-xl text-[#78716C] hover:text-[#0D9488] hover:bg-[#F0FDFA] cursor-pointer transition-colors"
            title="Configurar notificações push"
            aria-label="Configurar notificações push"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className="p-2 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3F0EA] cursor-pointer transition-colors"
            title={isMuted ? 'Ativar áudio' : 'Desativar áudio'}
            aria-label={isMuted ? 'Ativar áudio' : 'Desativar áudio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-[#E11D48]" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Coins (Moedas -> Opens Shop) */}
          {onOpenShop && (
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setIsStreakMenuOpen(false);
                onOpenShop();
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#FEF3C7]/70 hover:bg-[#FEF3C7] text-[#B45309] font-bold text-xs sm:text-sm cursor-pointer select-none transition-colors tabular-nums"
              title="Moedas — Abrir Loja (NameTAG, Classes, EasyLib Plus)"
            >
              <Coins className="w-4 h-4 sm:w-4 sm:h-4 text-[#D97706]" />
              <span>{userProfile.gems}</span>
            </button>
          )}

          {/* Streak (Ofensiva) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                setIsStreakMenuOpen(!isStreakMenuOpen);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-[#FFF1E6] text-[#EA580C] font-bold text-xs sm:text-sm cursor-pointer select-none transition-colors"
              title="Ofensiva diária"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 fill-[#EA580C] text-[#EA580C]" />
              <span className="tabular-nums">{userProfile.streakDays}</span>
            </button>

            {isStreakMenuOpen && (
              <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl border border-[#E8E2D9] shadow-lg p-4 z-50 animate-fade-in space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#1C1917]">
                      {userProfile.streakDays} {userProfile.streakDays === 1 ? 'dia seguido' : 'dias seguidos'}
                    </h4>
                    <p className="text-xs text-[#57534E]">
                      {practicedToday
                        ? 'Ofensiva de hoje garantida!'
                        : 'Conclua 1 atividade ou resumo hoje para somar.'}
                    </p>
                  </div>
                  <Flame className="w-7 h-7 fill-[#EA580C] text-[#EA580C] shrink-0" />
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {daysOfWeek.map((d, i) => (
                    <div key={i} className="space-y-1">
                      <span className="text-[10px] font-bold text-[#78716C]">{d.label}</span>
                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${
                          d.done
                            ? 'bg-[#EA580C] text-white'
                            : d.isToday
                            ? 'border-2 border-dashed border-[#EA580C] text-[#EA580C]'
                            : 'bg-[#F3F0EA] text-[#78716C]'
                        }`}
                      >
                        {d.done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2.5 border-t border-[#E8E2D9] flex items-center justify-between text-xs font-semibold text-[#57534E]">
                  <span>Bloqueio de ofensiva</span>
                  <span className="font-bold text-[#0F766E]">
                    {userProfile.streakFreezeCount > 0
                      ? `${userProfile.streakFreezeCount} ativo`
                      : 'Nenhum'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Auth CTA */}
          {onOpenAuthModal && !firebaseUser && (
            <button
              type="button"
              onClick={() => {
                soundService.playTap();
                onOpenAuthModal();
              }}
              disabled={authBusy}
              className="tactile-btn hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EA580C] hover:bg-[#DC4F06] disabled:opacity-60 text-white font-bold text-xs border-b-[3px] border-[#9A3412] cursor-pointer whitespace-nowrap"
            >
              <BookmarkCheck className="w-3.5 h-3.5 shrink-0" />
              <span>
                {authBusy ? 'Conectando...' : hasLocalProgress ? 'Entrar' : 'Entrar'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
