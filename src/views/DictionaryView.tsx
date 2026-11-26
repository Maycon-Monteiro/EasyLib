import React, { useMemo, useState } from 'react';
import {
  Search,
  Heart,
  BookOpen,
  Hand,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  CatalogSign,
  LIBRAS_CATALOG_FULL,
  LIBRAS_CATALOG_CATEGORIES
} from '../data/librasCatalog255';
import { computeDictionaryCategoryProgress } from '../utils/dictionaryProgress';
import { LibiMascot } from '../components/LibiMascot';
import { SignDetailView } from './SignDetailView';
import { soundService } from '../services/soundService';

interface DictionaryViewProps {
  userProfile: UserProfile;
  onToggleFavorite: (signId: string) => void;
  onMarkSignViewed?: (signId: string) => void;
}

type ProgressStatusFilter = 'all' | 'unseen' | 'viewed' | 'favorites';
type DictionaryViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE_GRID = 24;
const ITEMS_PER_PAGE_LIST = 40;

export const DictionaryView = ({
  userProfile,
  onToggleFavorite,
  onMarkSignViewed
}: DictionaryViewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<ProgressStatusFilter>('all');
  const [viewMode, setViewMode] = useState<DictionaryViewMode>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeDetailSign, setActiveDetailSign] = useState<CatalogSign | null>(null);

  const viewedIds = useMemo(
    () => userProfile.viewedSignIds ?? [],
    [userProfile.viewedSignIds]
  );
  const favoriteIds = useMemo(
    () => userProfile.favoriteSignIds ?? [],
    [userProfile.favoriteSignIds]
  );

  const viewedSet = useMemo(() => new Set(viewedIds), [viewedIds]);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const progressSummary = useMemo(
    () => computeDictionaryCategoryProgress(LIBRAS_CATALOG_FULL, viewedIds, favoriteIds),
    [viewedIds, favoriteIds]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of progressSummary.categories) {
      counts.set(item.category, item.totalCount);
    }
    return counts;
  }, [progressSummary.categories]);

  const categories = useMemo(
    () => ['Todas', ...LIBRAS_CATALOG_CATEGORIES],
    []
  );

  const filteredSigns = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return LIBRAS_CATALOG_FULL.filter((sign) => {
      const matchesCategory =
        selectedCategory === 'Todas' || sign.categoria === selectedCategory;
      if (!matchesCategory) return false;

      if (statusFilter === 'viewed' && !viewedSet.has(sign.id)) return false;
      if (statusFilter === 'favorites' && !favoriteSet.has(sign.id)) return false;
      if (
        statusFilter === 'unseen' &&
        (viewedSet.has(sign.id) || favoriteSet.has(sign.id))
      ) {
        return false;
      }

      if (!query) return true;
      return (
        sign.palavra.toLowerCase().includes(query) ||
        sign.slug.toLowerCase().includes(query) ||
        sign.significado.toLowerCase().includes(query) ||
        sign.categoria.toLowerCase().includes(query) ||
        String(sign.numericId) === query
      );
    });
  }, [searchTerm, selectedCategory, statusFilter, viewedSet, favoriteSet]);

  const itemsPerPage = viewMode === 'list' ? ITEMS_PER_PAGE_LIST : ITEMS_PER_PAGE_GRID;
  const totalPages = Math.max(1, Math.ceil(filteredSigns.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSigns = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredSigns.slice(start, start + itemsPerPage);
  }, [filteredSigns, safePage, itemsPerPage]);

  const scrollTopSmooth = () => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenSignDetail = (sign: CatalogSign) => {
    soundService.playTap();
    onMarkSignViewed?.(sign.id);
    setActiveDetailSign(sign);
    scrollTopSmooth();
  };

  const handleCategoryChange = (cat: string) => {
    soundService.playTap();
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (nextFilter: ProgressStatusFilter) => {
    soundService.playTap();
    setStatusFilter(nextFilter);
    setCurrentPage(1);
  };

  const handleViewModeChange = (nextMode: DictionaryViewMode) => {
    if (nextMode === viewMode) return;
    soundService.playTap();
    setViewMode(nextMode);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (activeDetailSign) {
    return (
      <SignDetailView
        sign={activeDetailSign}
        isFavorite={favoriteSet.has(activeDetailSign.id)}
        onBack={() => {
          setActiveDetailSign(null);
          scrollTopSmooth();
        }}
        onToggleFavorite={onToggleFavorite}
        onSelectSign={(nextSign) => {
          onMarkSignViewed?.(nextSign.id);
          setActiveDetailSign(nextSign);
          scrollTopSmooth();
        }}
        onBrowseCategory={(category) => {
          setSelectedCategory(category);
          setSearchTerm('');
          setCurrentPage(1);
          setActiveDetailSign(null);
          scrollTopSmooth();
        }}
        onBrowseAll={() => {
          setSelectedCategory('Todas');
          setStatusFilter('all');
          setSearchTerm('');
          setCurrentPage(1);
          setActiveDetailSign(null);
          scrollTopSmooth();
        }}
        onMarkViewed={onMarkSignViewed}
      />
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-2 space-y-4 select-none">
      {/* 1. Top Search Bar + Compact Library Banner */}
      <div className="space-y-3">
        <div className="bg-[#0D9488] rounded-2xl p-4 sm:p-5 text-white border-b-4 border-[#0F766E] flex items-center justify-between gap-4 min-w-0">
          <div className="space-y-1 min-w-0 flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#CCFBF1] block tabular-nums">
              {LIBRAS_CATALOG_FULL.length} sinais em Libras
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold truncate">
              Biblioteca de Sinais
            </h1>
            <p className="text-xs sm:text-sm text-white/90 font-medium text-justify">
              Toque em qualquer sinal para abrir a página completa com vídeo, como fazer, definição e exemplos.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            aria-label="Pesquisar sinais pelo nome em tempo real"
            placeholder="Pesquisar sinal pelo nome (ex: Abraçar, Bom dia, Família, Verbos)..."
            className="w-full pl-11 pr-10 py-3 rounded-xl bg-white border border-[#E8E2D9] text-[#1C1917] placeholder-[#78716C] font-semibold text-sm focus:outline-none focus:border-[#0D9488]"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              aria-label="Limpar pesquisa"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3F0EA] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Category & Overall Progress Bar Panel */}
      <section
        aria-label="Progresso no Dicionário por categoria"
        className="bg-white rounded-2xl border border-[#E8E2D9] p-4 sm:p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#F0FDFA] text-[#0F766E] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-bold text-[#1C1917] leading-tight">
                Progresso por Categoria
              </h2>
              <p className="text-xs font-medium text-[#57534E] tabular-nums">
                {progressSummary.totalViewed} visualizados · {progressSummary.totalFavorites} favoritos
              </p>
            </div>
          </div>

          <div className="text-right tabular-nums shrink-0">
            <div className="font-display text-lg sm:text-xl font-bold text-[#0F766E]">
              {progressSummary.totalExplored}/{progressSummary.totalSigns}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
              {progressSummary.overallPercent}% explorado
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={progressSummary.overallPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso total de sinais visualizados ou favoritados"
          className="h-2.5 w-full rounded-full bg-[#F3F0EA] overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-[#0D9488] transition-all duration-300"
            style={{ width: `${progressSummary.overallPercent}%` }}
          />
        </div>

        {/* Per-Category Progress Bars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {progressSummary.categories.map((item) => {
            const isActiveCategory = selectedCategory === item.category;
            return (
              <button
                key={item.category}
                type="button"
                onClick={() =>
                  handleCategoryChange(isActiveCategory ? 'Todas' : item.category)
                }
                aria-pressed={isActiveCategory}
                className={`text-left rounded-xl border p-2.5 transition-colors cursor-pointer space-y-1.5 min-w-0 ${
                  isActiveCategory
                    ? 'border-[#0D9488] bg-[#F0FDFA]'
                    : 'border-[#E8E2D9] bg-[#FAF9F6] hover:border-[#0D9488]/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span
                    className={`text-xs font-bold truncate ${
                      isActiveCategory ? 'text-[#0F766E]' : 'text-[#1C1917]'
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-[11px] font-bold text-[#57534E] tabular-nums whitespace-nowrap shrink-0">
                    {item.exploredCount}/{item.totalCount} ({item.percent}%)
                  </span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-[#E8E2D9] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      item.percent >= 100
                        ? 'bg-[#16A34A]'
                        : isActiveCategory
                          ? 'bg-[#EA580C]'
                          : 'bg-[#0D9488]'
                    }`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Category Filter Tabs Immediately Below the Progress Bar */}
      <nav aria-label="Filtrar sinais por categoria" className="bg-white rounded-2xl border border-[#E8E2D9] p-2">
        <div
          role="tablist"
          aria-label="Categorias do dicionário"
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'Todas' ? LIBRAS_CATALOG_FULL.length : categoryCounts.get(cat) ?? 0;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 tabular-nums
                  ${isSelected
                    ? 'bg-[#EA580C] text-white border-b-2 border-[#9A3412]'
                    : 'bg-[#FAF9F6] text-[#57534E] hover:bg-[#F3F0EA] hover:text-[#1C1917]'}
                `}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </nav>

      {/* 4. Toolbar: Status Filters + Results Count + Grid/List View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 no-scrollbar">
          {(
            [
              { id: 'all', label: 'Todos' },
              { id: 'unseen', label: 'Não explorados' },
              { id: 'viewed', label: 'Visualizados' },
              { id: 'favorites', label: 'Favoritos' }
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleStatusFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  active
                    ? 'bg-[#0D9488] text-white'
                    : 'bg-white border border-[#E8E2D9] text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] tabular-nums whitespace-nowrap">
            {filteredSigns.length} sinais · Pág. {safePage}/{totalPages}
          </span>

          {/* View Mode Selector: Grid vs List */}
          <div
            role="group"
            aria-label="Modo de visualização dos sinais"
            className="inline-flex items-center p-1 rounded-xl bg-white border border-[#E8E2D9] shrink-0"
          >
            <button
              type="button"
              onClick={() => handleViewModeChange('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'grid'
                  ? 'bg-[#0D9488] text-white'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grade</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              aria-pressed={viewMode === 'list'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewMode === 'list'
                  ? 'bg-[#0D9488] text-white'
                  : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mid-Dictionary Study Companion */}
      <div className="bg-white rounded-2xl border border-[#E8E2D9] px-4 py-3 flex items-center gap-3.5">
        <LibiMascot
          mood={searchTerm.trim().length > 0 ? 'curioso' : selectedCategory === 'Todas' ? 'lendo' : 'curioso'}
          size="xs"
          onClick={() => handleCategoryChange('Todas')}
        />
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-sm text-[#1C1917] leading-snug">
            {searchTerm.trim().length > 0
              ? `Explorando resultados para "${searchTerm.trim()}"`
              : selectedCategory === 'Todas'
              ? 'Toque em qualquer sinal para abrir o vídeo e os detalhes'
              : `Categoria selecionada: ${selectedCategory}`}
          </div>
          <p className="text-xs text-[#57534E] font-medium">
            {progressSummary.totalExplored === 0
              ? 'Comece marcando seus sinais favoritos para acompanhar o progresso acima.'
              : `Você já explorou ${progressSummary.totalExplored} de ${progressSummary.totalSigns} sinais do acervo.`}
          </p>
        </div>
      </div>

      {/* 5. Signs Grid or Compact List View */}
      {paginatedSigns.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E8E2D9] flex flex-col items-center gap-3">
          <LibiMascot mood="curioso" size="md" />
          <p className="font-semibold text-sm text-[#57534E]">
            Nenhum sinal encontrado para esse filtro.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginatedSigns.map((sign) => {
            const isFavorite = favoriteSet.has(sign.id);
            const isViewed = viewedSet.has(sign.id);

            return (
              <div
                key={sign.id}
                onClick={() => handleOpenSignDetail(sign)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenSignDetail(sign);
                  }
                }}
                className="bg-white rounded-2xl border border-[#E8E2D9] hover:border-[#0D9488] p-4 transition-colors cursor-pointer flex items-center justify-between gap-3 min-w-0 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] text-[#0F766E] group-hover:bg-[#0D9488] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Hand className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#1C1917] group-hover:text-[#0F766E] truncate">
                      <span className="text-[#78716C] font-semibold mr-1.5 tabular-nums">
                        #{sign.numericId}
                      </span>
                      {sign.palavra}
                    </div>
                    <div className="text-xs text-[#57534E] font-medium truncate flex items-center gap-1.5">
                      <span className="truncate">{sign.categoria}</span>
                      {isViewed && (
                        <span className="inline-flex items-center gap-0.5 text-[#0F766E] font-semibold shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Visto</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundService.playTap();
                      onToggleFavorite(sign.id);
                    }}
                    aria-label={`Favoritar ${sign.palavra}`}
                    className="p-1.5 rounded-lg text-[#78716C] hover:text-[#E11D48] hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorite ? 'fill-[#E11D48] text-[#E11D48]' : ''}`}
                    />
                  </button>
                  <ChevronRight className="w-4 h-4 text-[#78716C] group-hover:text-[#0F766E]" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8E2D9] divide-y divide-[#E8E2D9] overflow-hidden">
          {paginatedSigns.map((sign) => {
            const isFavorite = favoriteSet.has(sign.id);
            const isViewed = viewedSet.has(sign.id);

            return (
              <div
                key={sign.id}
                onClick={() => handleOpenSignDetail(sign)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenSignDetail(sign);
                  }
                }}
                className="px-3.5 sm:px-4 py-2.5 hover:bg-[#FAF9F6] transition-colors cursor-pointer flex items-center justify-between gap-3 min-w-0 group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-bold text-[#78716C] tabular-nums w-11 shrink-0">
                    #{sign.numericId}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="font-bold text-sm text-[#1C1917] group-hover:text-[#0F766E] truncate">
                        {sign.palavra}
                      </span>
                      <span className="hidden sm:inline text-xs text-[#78716C] font-medium truncate">
                        {sign.significado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="hidden md:inline text-xs font-medium text-[#57534E] whitespace-nowrap">
                    {sign.categoria}
                  </span>
                  {isViewed && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-[#0F766E] font-bold whitespace-nowrap">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Visto</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundService.playTap();
                      onToggleFavorite(sign.id);
                    }}
                    aria-label={`Favoritar ${sign.palavra}`}
                    className="p-1.5 rounded-lg text-[#78716C] hover:text-[#E11D48] hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorite ? 'fill-[#E11D48] text-[#E11D48]' : ''}`}
                    />
                  </button>
                  <ChevronRight className="w-4 h-4 text-[#78716C] group-hover:text-[#0F766E]" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => {
              soundService.playTap();
              setCurrentPage((p) => Math.max(1, p - 1));
              scrollTopSmooth();
            }}
            className="tactile-btn flex items-center gap-1 px-3.5 py-2 rounded-xl bg-white border border-[#E8E2D9] border-b-[3px] border-b-[#D6CFC5] text-xs font-bold text-[#1C1917] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <span className="text-xs font-bold text-[#57534E] tabular-nums">
            {safePage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => {
              soundService.playTap();
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              scrollTopSmooth();
            }}
            className="tactile-btn flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#0D9488] text-white border-b-[3px] border-[#0F766E] text-xs font-bold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
