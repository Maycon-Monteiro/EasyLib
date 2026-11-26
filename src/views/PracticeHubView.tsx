import React, { useState } from 'react';
import {
  Dumbbell,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Hand,
  Type
} from 'lucide-react';
import { UserProfile, PathNode, Unit } from '../types';
import {
  areConflictingOrEquivalentSigns,
  CatalogSign,
  findCatalogSign,
  LIBRAS_CATALOG_255
} from '../data/librasCatalog255';
import { SignSchematicVisualizer } from '../components/SignSchematicVisualizer';
import { LibiMascot, LibiPose } from '../components/LibiMascot';
import { soundService } from '../services/soundService';

interface PracticeHubViewProps {
  userProfile: UserProfile;
  onStartPractice: (node: PathNode, unit: Unit) => void;
  onRefillHearts?: () => void;
  onOpenDictionary?: () => void;
}

export const PracticeHubView = ({
  userProfile,
  onOpenDictionary
}: PracticeHubViewProps) => {
  const [activePracticeTab, setActivePracticeTab] = useState<'hub' | 'memory_game'>('hub');
  const [hubTipIdx, setHubTipIdx] = useState(0);

  const hubCompanionTips: Array<{ pose: LibiPose; title: string; body: string }> = [
    {
      pose: 'treinando',
      title: 'Modo Treino Livre com a Libi',
      body: 'Alterne entre datilologia rápida e jogo da memória para ganhar agilidade no reconhecimento dos sinais.'
    },
    {
      pose: 'lendo',
      title: 'Explore a Biblioteca Visual',
      body: 'Assista aos vídeos dos sinais em velocidade normal ou câmera lenta sempre que quiser revisar um vocabulário.'
    },
    {
      pose: 'eu_te_amo',
      title: 'Praticar todos os dias faz diferença',
      body: 'Toque na Libi sempre que quiser uma nova dica rápida de treino!'
    }
  ];
  const currentHubTip = hubCompanionTips[hubTipIdx % hubCompanionTips.length];

  // --- 1. Datilologia Quick Trainer State ---
  const [dactylologyInput, setDactylologyInput] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const wordsList = ['LIBRAS', 'SURDO', 'BOM', 'AMOR', 'CASA', 'PAI', 'FLOR', 'AMIGO', 'PAZ', 'VIDA'];
  const currentWord = wordsList[currentWordIndex];
  const [showDactylologySuccess, setShowDactylologySuccess] = useState(false);

  // --- 2. Memory Game State ---
  interface MemoryCard {
    id: number;
    signId: string;
    type: 'sign' | 'word';
    label: string;
    isFlipped: boolean;
    isMatched: boolean;
  }
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCardIds, setFlippedCardIds] = useState<number[]>([]);
  const [memoryMatchesCount, setMemoryMatchesCount] = useState(0);
  const [memoryGameOver, setMemoryGameOver] = useState(false);

  const initMemoryGame = () => {
    const shuffledCatalog = [...LIBRAS_CATALOG_255];
    for (let i = shuffledCatalog.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffledCatalog[i];
      shuffledCatalog[i] = shuffledCatalog[j];
      shuffledCatalog[j] = tmp;
    }

    const selectedSigns: CatalogSign[] = [];
    for (const candidate of shuffledCatalog) {
      if (selectedSigns.length >= 6) break;
      if (!selectedSigns.some((s) => areConflictingOrEquivalentSigns(s, candidate))) {
        selectedSigns.push(candidate);
      }
    }

    const cards: MemoryCard[] = [];
    selectedSigns.forEach((sign, idx) => {
      cards.push({
        id: idx * 2,
        signId: sign.id,
        type: 'sign',
        label: sign.palavra,
        isFlipped: false,
        isMatched: false
      });
      cards.push({
        id: idx * 2 + 1,
        signId: sign.id,
        type: 'word',
        label: sign.palavra,
        isFlipped: false,
        isMatched: false
      });
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = cards[i];
      cards[i] = cards[j];
      cards[j] = tmp;
    }
    setMemoryCards(cards);
    setFlippedCardIds([]);
    setMemoryMatchesCount(0);
    setMemoryGameOver(false);
  };

  const handleCardClick = (card: MemoryCard) => {
    if (card.isFlipped || card.isMatched || flippedCardIds.length >= 2) return;
    soundService.playTap();

    const newCards = memoryCards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setMemoryCards(newCards);

    const newFlipped = [...flippedCardIds, card.id];
    setFlippedCardIds(newFlipped);

    if (newFlipped.length === 2) {
      const firstCard = newCards.find((c) => c.id === newFlipped[0]);
      const secondCard = newCards.find((c) => c.id === newFlipped[1]);

      if (firstCard && secondCard && firstCard.signId === secondCard.signId) {
        setTimeout(() => {
          soundService.playCorrect();
          setMemoryCards((prev) =>
            prev.map((c) => (c.signId === firstCard.signId ? { ...c, isMatched: true } : c))
          );
          setFlippedCardIds([]);
          const newMatches = memoryMatchesCount + 1;
          setMemoryMatchesCount(newMatches);
          if (newMatches >= 6) {
            setMemoryGameOver(true);
          }
        }, 500);
      } else {
        setTimeout(() => {
          soundService.playIncorrect();
          setMemoryCards((prev) =>
            prev.map((c) => (newFlipped.includes(c.id) ? { ...c, isFlipped: false } : c))
          );
          setFlippedCardIds([]);
        }, 900);
      }
    }
  };

  const handleTestWord = () => {
    if (dactylologyInput.trim().toUpperCase() === currentWord) {
      soundService.playCorrect();
      setShowDactylologySuccess(true);
      setTimeout(() => {
        setShowDactylologySuccess(false);
        setDactylologyInput('');
        setCurrentWordIndex((prev) => (prev + 1) % wordsList.length);
      }, 1200);
    } else {
      soundService.playIncorrect();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-2 space-y-6 select-none animate-fade-in">
      {/* Top Practice Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => {
            soundService.playTap();
            setActivePracticeTab('hub');
          }}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 transition-colors cursor-pointer ${
            activePracticeTab === 'hub'
              ? 'bg-[#0D9488] text-white border-b-2 border-[#0F766E]'
              : 'bg-[#F3F0EA] text-[#57534E] hover:bg-[#E8E2D9] hover:text-[#1C1917]'
          }`}
        >
          Todos os treinos
        </button>
        <button
          onClick={() => {
            soundService.playTap();
            initMemoryGame();
            setActivePracticeTab('memory_game');
          }}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs shrink-0 transition-colors cursor-pointer ${
            activePracticeTab === 'memory_game'
              ? 'bg-[#0D9488] text-white border-b-2 border-[#0F766E]'
              : 'bg-[#F3F0EA] text-[#57534E] hover:bg-[#E8E2D9] hover:text-[#1C1917]'
          }`}
        >
          Memória de sinais
        </button>
      </div>

      {/* 1. MAIN PRACTICE HUB OVERVIEW */}
      {activePracticeTab === 'hub' && (
        <div className="space-y-5 animate-fade-in">
          {/* Library Overview Card */}
          <div className="bg-[#0D9488] rounded-2xl p-5 sm:p-6 text-white border-b-4 border-[#0F766E] space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#CCFBF1]">
                  Vocabulário completo
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  Biblioteca com 255 Sinais
                </h2>
                <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed text-justify">
                  Consulte vídeos e significados dos sinais em Libras antes de praticar nas lições.
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playTap();
                if (onOpenDictionary) onOpenDictionary();
              }}
              className="tactile-btn w-full py-3.5 px-6 rounded-xl bg-white text-[#0F766E] hover:bg-[#F0FDFA] font-bold text-xs uppercase tracking-wider border-b-4 border-[#99F6E4] cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Abrir biblioteca</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mid-Hub Interactive Companion Card */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 sm:p-5 flex items-center gap-4">
            <LibiMascot
              mood={currentHubTip.pose}
              outfit={userProfile.duoOutfit}
              size="md"
              onClick={() => setHubTipIdx((i) => i + 1)}
            />
            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#EA580C]">
                Dica de treino · Toque na Libi
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-[#1C1917] leading-snug">
                {currentHubTip.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] font-medium leading-relaxed text-justify">
                {currentHubTip.body}
              </p>
            </div>
          </div>

          {/* Activity 2: Interactive Datilologia Trainer */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FFF1E6] text-[#EA580C] flex items-center justify-center shrink-0">
                <Type className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-display font-bold text-base text-[#1C1917]">
                  Treino rápido de datilologia
                </h4>
                <p className="text-xs text-[#57534E] font-medium">
                  Palavra alvo:{' '}
                  <span className="font-bold text-[#EA580C] tracking-widest">{currentWord}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FAF9F6] border border-[#E8E2D9] overflow-x-auto">
              {currentWord.split('').map((letter, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-1 bg-white px-3 py-2 rounded-lg border border-[#E8E2D9]"
                >
                  <Hand className="w-4 h-4 text-[#0D9488]" />
                  <span className="text-xs font-bold text-[#EA580C]">{letter}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dactylologyInput}
                onChange={(e) => setDactylologyInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleTestWord()}
                placeholder="Digite a palavra soletrada..."
                className="flex-1 px-4 py-3 rounded-xl border border-[#E8E2D9] font-bold text-sm uppercase text-[#1C1917] focus:outline-none focus:border-[#0D9488]"
              />
              <button
                onClick={handleTestWord}
                className="tactile-btn px-5 py-3 rounded-xl bg-[#EA580C] hover:bg-[#DC4F06] text-white font-bold text-xs uppercase tracking-wider border-b-[3px] border-[#9A3412] cursor-pointer"
              >
                {showDactylologySuccess ? 'Correto' : 'Verificar'}
              </button>
            </div>
          </div>

          {/* Activity 3: Memory Game */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F3F0EA] text-[#1C1917] flex items-center justify-center shrink-0">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-[#1C1917]">
                  Jogo da Memória dos Sinais
                </h4>
                <p className="text-xs text-[#57534E] font-medium text-justify">
                  Encontre os pares de sinais e significados correspondentes na biblioteca.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundService.playTap();
                initMemoryGame();
                setActivePracticeTab('memory_game');
              }}
              className="tactile-btn px-5 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#DC4F06] text-white font-bold text-xs uppercase tracking-wider border-b-[3px] border-[#9A3412] cursor-pointer shrink-0"
            >
              Jogar
            </button>
          </div>
        </div>
      )}

      {/* 2. JOGO DA MEMÓRIA */}
      {activePracticeTab === 'memory_game' && (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 space-y-5 animate-scale-in">
          <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFF1E6] text-[#EA580C] flex items-center justify-center">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#1C1917]">
                  Jogo da Memória de Sinais
                </h3>
                <span className="text-xs font-semibold text-[#57534E]">
                  Pares encontrados: {memoryMatchesCount} de 6
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={initMemoryGame}
                className="p-2 rounded-xl bg-[#F3F0EA] text-[#57534E] hover:text-[#1C1917] cursor-pointer"
                title="Reiniciar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActivePracticeTab('hub')}
                className="text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {memoryCards.map((card) => {
              const isRevealed = card.isFlipped || card.isMatched;
              const cardCatalogSign = card.type === 'sign' ? findCatalogSign(card.signId) : null;
              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  disabled={card.isMatched}
                  className={`
                    tactile-btn h-28 sm:h-32 rounded-xl border border-b-4 font-bold text-xs cursor-pointer flex flex-col items-center justify-center p-1.5 text-center select-none overflow-hidden
                    ${card.isMatched
                      ? 'bg-[#F0FDFA] border-[#99F6E4] border-b-[#0D9488] text-[#0F766E] opacity-80'
                      : isRevealed
                      ? 'bg-white border-[#EA580C] border-b-[#9A3412] text-[#1C1917]'
                      : 'bg-[#0D9488] border-[#0F766E] border-b-[#115E59] text-white'}
                  `}
                >
                  {isRevealed ? (
                    card.type === 'sign' && cardCatalogSign ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 animate-fade-in">
                        <SignSchematicVisualizer
                          sign={cardCatalogSign}
                          mini={true}
                          hideControls={true}
                          className="w-full flex-1 border-0 bg-transparent pointer-events-none"
                        />
                        {card.isMatched && (
                          <span className="text-[10px] font-bold truncate max-w-full px-1">
                            {card.label}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 animate-fade-in px-1">
                        <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                          Palavra
                        </span>
                        <div className="font-bold text-xs line-clamp-2">{card.label}</div>
                      </div>
                    )
                  ) : (
                    <Hand className="w-5 h-5 text-white/90" />
                  )}
                </button>
              );
            })}
          </div>

          {memoryGameOver && (
            <div className="p-5 rounded-2xl bg-[#0D9488] text-white text-center space-y-3 animate-scale-in">
              <LibiMascot mood="campeao" outfit={userProfile.duoOutfit} size="sm" className="mx-auto" />
              <h4 className="font-display text-xl font-bold">
                Todos os pares encontrados
              </h4>
              <div className="flex justify-center gap-3 pt-1">
                <button
                  onClick={initMemoryGame}
                  className="tactile-btn py-2.5 px-5 rounded-xl bg-white text-[#0F766E] font-bold text-xs uppercase border-b-[3px] border-[#99F6E4] cursor-pointer"
                >
                  Jogar novamente
                </button>
                <button
                  onClick={() => setActivePracticeTab('hub')}
                  className="tactile-btn py-2.5 px-5 rounded-xl bg-[#0F766E] text-white font-bold text-xs uppercase border-b-[3px] border-[#115E59] cursor-pointer"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
