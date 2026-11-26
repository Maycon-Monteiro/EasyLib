import React, { useState } from 'react';
import {
  Coins,
  Tag,
  ShieldCheck,
  Crown,
  Flame,
  Check,
  Sparkles,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  EASYLIB_PLUS_COIN_PRICE,
  NAMETAG_CATALOG,
  PLAYER_CLASSES_CATALOG,
  STREAK_FREEZE_COIN_PRICE
} from '../data/customizationCatalog';
import { NameTagIcon, PlayerClassIcon } from '../components/CatalogIcons';
import { NameTagBadge } from '../components/NameTagBadge';
import { soundService } from '../services/soundService';

interface ShopViewProps {
  userProfile: UserProfile;
  onBuyNameTag: (tagId: string, cost: number) => void;
  onEquipNameTag: (tagId: string) => void;
  onBuyClass: (classId: string, cost: number) => void;
  onEquipClass: (classId: string) => void;
  onBuyEasyLibPlus: (cost: number) => void;
  onBuyStreakFreeze: (cost: number) => void;
}

type ShopSectionTab = 'nametags' | 'classes' | 'plus';

export const ShopView: React.FC<ShopViewProps> = ({
  userProfile,
  onBuyNameTag,
  onEquipNameTag,
  onBuyClass,
  onEquipClass,
  onBuyEasyLibPlus,
  onBuyStreakFreeze
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ShopSectionTab>('nametags');

  const unlockedTags = userProfile.unlockedNameTags || ['tag_classic'];
  const unlockedClasses = userProfile.unlockedClasses || ['class_aprendiz'];

  return (
    <div className="w-full max-w-3xl mx-auto py-2 space-y-5 select-none animate-fade-in">
      {/* Top Coins Banner */}
      <div className="bg-[#0D9488] rounded-2xl p-5 text-white border-b-4 border-[#0F766E] flex items-center justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#CCFBF1] block">
            Loja de Recompensas
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">
            Moedas &amp; Estilo
          </h1>
          <p className="text-xs sm:text-sm text-white/90 font-medium text-justify">
            Use suas moedas para personalizar sua NameTAG, desbloquear Classes e ativar o EasyLib Plus.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-white/15 border border-white/25 flex items-center gap-2 shrink-0 tabular-nums">
          <Coins className="w-6 h-6 text-[#FDE047]" />
          <div className="text-right">
            <div className="font-display text-2xl font-bold leading-none">{userProfile.gems}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#CCFBF1]">
              moedas
            </div>
          </div>
        </div>
      </div>

      {/* Live NameTAG Preview Card */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">
            Prévia da sua NameTAG atual
          </span>
          <span className="text-[11px] font-semibold text-[#78716C]">
            Visível no Perfil e Ranking
          </span>
        </div>
        <NameTagBadge
          name={userProfile.name}
          username={userProfile.username}
          nameTagId={userProfile.nameTagId}
          nameTagImage={userProfile.nameTagImage}
          playerClassId={userProfile.playerClassId}
          isPlus={userProfile.isSuperDuolingo}
        />
      </div>

      {/* Section Tabs */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#F3F0EA] p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            setActiveSubTab('nametags');
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            activeSubTab === 'nametags'
              ? 'bg-white text-[#1C1917] shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-[#0D9488]" />
          <span>NameTAG</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            setActiveSubTab('classes');
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            activeSubTab === 'classes'
              ? 'bg-white text-[#1C1917] shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Classes</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundService.playTap();
            setActiveSubTab('plus');
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
            activeSubTab === 'plus'
              ? 'bg-white text-[#1C1917] shadow-xs'
              : 'text-[#57534E] hover:text-[#1C1917]'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-[#D97706]" />
          <span>EasyLib Plus</span>
        </button>
      </div>

      {/* TAB 1: NameTAG Styles */}
      {activeSubTab === 'nametags' && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-[#1C1917]">
            Estilos de NameTAG
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NAMETAG_CATALOG.map((tag) => {
              const owned = unlockedTags.includes(tag.id);
              const equipped = userProfile.nameTagId === tag.id;
              const canAfford = userProfile.gems >= tag.price;

              return (
                <div
                  key={tag.id}
                  className="bg-white rounded-2xl border border-[#E8E2D9] p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div
                      className={`rounded-xl border-2 px-3 py-2 flex items-center justify-between ${tag.containerClass}`}
                    >
                      <span className={`font-display font-bold text-sm ${tag.textColorClass}`}>
                        {userProfile.name}
                      </span>
                      <span style={{ color: tag.accentHex }}>
                        <NameTagIcon iconId={tag.badgeIcon} className="w-4 h-4" />
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1C1917]">{tag.name}</h4>
                      <p className="text-xs text-[#57534E] leading-snug text-justify">{tag.description}</p>
                    </div>
                  </div>

                  {owned ? (
                    <button
                      type="button"
                      disabled={equipped}
                      onClick={() => {
                        soundService.playCorrect();
                        onEquipNameTag(tag.id);
                      }}
                      className={`tactile-btn w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider border-b-[3px] flex items-center justify-center gap-1.5 ${
                        equipped
                          ? 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4] cursor-default'
                          : 'bg-[#0D9488] hover:bg-[#0F766E] text-white border-[#115E59] cursor-pointer'
                      }`}
                    >
                      {equipped && <Check className="w-3.5 h-3.5" />}
                      <span>{equipped ? 'Equipada' : 'Usar NameTAG'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        soundService.playCorrect();
                        onBuyNameTag(tag.id, tag.price);
                      }}
                      className={`tactile-btn w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider border-b-[3px] flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-[#EA580C] hover:bg-[#DC4F06] text-white border-[#9A3412] cursor-pointer'
                          : 'bg-[#F3F0EA] text-[#78716C] border-[#E8E2D9] cursor-not-allowed'
                      }`}
                    >
                      {!canAfford && <Lock className="w-3.5 h-3.5" />}
                      <Coins className="w-3.5 h-3.5" />
                      <span>Comprar · {tag.price} moedas</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Player Classes */}
      {activeSubTab === 'classes' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 space-y-1">
            <h2 className="font-display font-bold text-base text-[#1C1917]">
              Classes &amp; Títulos de Libras
            </h2>
            <p className="text-xs text-[#57534E] text-justify">
              Escolha ou compre novas classes com moedas para exibir seu título no perfil e nas salas de ranking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PLAYER_CLASSES_CATALOG.map((cls) => {
              const owned = unlockedClasses.includes(cls.id);
              const equipped = userProfile.playerClassId === cls.id;
              const canAfford = userProfile.gems >= cls.price;

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-[#E8E2D9] p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-white"
                      style={{ backgroundColor: cls.badgeColorHex }}
                    >
                      <PlayerClassIcon iconId={cls.icon} className="w-3.5 h-3.5" />
                      <span>{cls.name}</span>
                    </span>
                    <p className="text-xs text-[#57534E] leading-relaxed text-justify">{cls.description}</p>
                  </div>

                  {owned ? (
                    <button
                      type="button"
                      disabled={equipped}
                      onClick={() => {
                        soundService.playCorrect();
                        onEquipClass(cls.id);
                      }}
                      className={`tactile-btn w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider border-b-[3px] flex items-center justify-center gap-1.5 ${
                        equipped
                          ? 'bg-[#F0FDFA] text-[#0F766E] border-[#99F6E4] cursor-default'
                          : 'bg-[#0D9488] hover:bg-[#0F766E] text-white border-[#115E59] cursor-pointer'
                      }`}
                    >
                      {equipped && <Check className="w-3.5 h-3.5" />}
                      <span>{equipped ? 'Classe ativa' : 'Equipar classe'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => {
                        soundService.playCorrect();
                        onBuyClass(cls.id, cls.price);
                      }}
                      className={`tactile-btn w-full py-2 rounded-xl font-bold text-xs uppercase tracking-wider border-b-[3px] flex items-center justify-center gap-1.5 ${
                        canAfford
                          ? 'bg-[#EA580C] hover:bg-[#DC4F06] text-white border-[#9A3412] cursor-pointer'
                          : 'bg-[#F3F0EA] text-[#78716C] border-[#E8E2D9] cursor-not-allowed'
                      }`}
                    >
                      {!canAfford && <Lock className="w-3.5 h-3.5" />}
                      <Coins className="w-3.5 h-3.5" />
                      <span>Comprar · {cls.price} moedas</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EasyLib Plus & Ofensiva */}
      {activeSubTab === 'plus' && (
        <div className="space-y-4">
          <div className="rounded-3xl border-2 border-[#F59E0B] bg-gradient-to-br from-[#78350F] via-[#9A3412] to-[#0F766E] p-6 text-white space-y-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#F59E0B] text-[#1C1917] font-extrabold text-[11px] uppercase tracking-wider">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Assinatura por moedas</span>
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  EasyLib Plus
                </h2>
              </div>
              <Sparkles className="w-8 h-8 text-[#FDE047] shrink-0" />
            </div>

            <ul className="space-y-2 text-xs sm:text-sm font-medium text-white/95">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5EEAD4] shrink-0" />
                <span>+50% de XP e moedas bônus ao concluir lições na trilha</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5EEAD4] shrink-0" />
                <span>Selo dourado PLUS visível na sua NameTAG e no Ranking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#5EEAD4] shrink-0" />
                <span>+1 Bloqueio de ofensiva automático incluído na ativação</span>
              </li>
            </ul>

            {userProfile.isSuperDuolingo ? (
              <div className="p-3.5 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center gap-2 font-bold text-sm text-[#FEF3C7]">
                <Check className="w-5 h-5 text-[#5EEAD4]" />
                <span>EasyLib Plus ativo na sua conta!</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={userProfile.gems < EASYLIB_PLUS_COIN_PRICE}
                onClick={() => {
                  soundService.playLessonComplete();
                  onBuyEasyLibPlus(EASYLIB_PLUS_COIN_PRICE);
                }}
                className="tactile-btn w-full py-3.5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-[#1C1917] font-extrabold text-sm uppercase tracking-wider border-b-4 border-[#B45309] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" />
                <span>Ativar EasyLib Plus · {EASYLIB_PLUS_COIN_PRICE} moedas</span>
              </button>
            )}
          </div>

          {/* Streak Freeze Item */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FFF1E6] text-[#EA580C] flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 fill-[#EA580C]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display font-bold text-base text-[#1C1917]">
                  Bloqueio de ofensiva ({userProfile.streakFreezeCount} ativo)
                </h3>
                <p className="text-xs text-[#57534E] text-justify">
                  Protege sua sequência de dias seguidos caso você perca 1 dia sem praticar.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={userProfile.gems < STREAK_FREEZE_COIN_PRICE}
              onClick={() => {
                soundService.playCorrect();
                onBuyStreakFreeze(STREAK_FREEZE_COIN_PRICE);
              }}
              className="tactile-btn px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-45 text-white font-bold text-xs uppercase border-b-[3px] border-[#115E59] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>{STREAK_FREEZE_COIN_PRICE} moedas</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
