import {
  CatalogSign,
  LIBRAS_CATALOG_CATEGORIES,
  LibrasCatalogCategory
} from '../data/librasCatalog255';

export interface CategoryProgressItem {
  category: LibrasCatalogCategory;
  totalCount: number;
  exploredCount: number;
  viewedCount: number;
  favoriteCount: number;
  percent: number;
}

export interface DictionaryProgressSummary {
  totalSigns: number;
  totalExplored: number;
  totalViewed: number;
  totalFavorites: number;
  overallPercent: number;
  categories: CategoryProgressItem[];
}

export function computeDictionaryCategoryProgress(
  catalog: readonly CatalogSign[],
  viewedSignIds: readonly string[] = [],
  favoriteSignIds: readonly string[] = []
): DictionaryProgressSummary {
  const viewedSet = new Set(viewedSignIds);
  const favoriteSet = new Set(favoriteSignIds);

  const buckets = new Map<
    LibrasCatalogCategory,
    { totalCount: number; exploredCount: number; viewedCount: number; favoriteCount: number }
  >();

  for (const cat of LIBRAS_CATALOG_CATEGORIES) {
    buckets.set(cat, {
      totalCount: 0,
      exploredCount: 0,
      viewedCount: 0,
      favoriteCount: 0
    });
  }

  let totalExplored = 0;
  let totalViewed = 0;
  let totalFavorites = 0;

  for (const sign of catalog) {
    let bucket = buckets.get(sign.categoria);
    if (!bucket) {
      bucket = { totalCount: 0, exploredCount: 0, viewedCount: 0, favoriteCount: 0 };
      buckets.set(sign.categoria, bucket);
    }

    const isViewed = viewedSet.has(sign.id);
    const isFavorite = favoriteSet.has(sign.id);
    const isExplored = isViewed || isFavorite;

    bucket.totalCount += 1;
    if (isViewed) {
      bucket.viewedCount += 1;
      totalViewed += 1;
    }
    if (isFavorite) {
      bucket.favoriteCount += 1;
      totalFavorites += 1;
    }
    if (isExplored) {
      bucket.exploredCount += 1;
      totalExplored += 1;
    }
  }

  const categories: CategoryProgressItem[] = LIBRAS_CATALOG_CATEGORIES.map((category) => {
    const stats = buckets.get(category) ?? {
      totalCount: 0,
      exploredCount: 0,
      viewedCount: 0,
      favoriteCount: 0
    };
    const percent =
      stats.totalCount > 0
        ? Math.round((stats.exploredCount / stats.totalCount) * 100)
        : 0;

    return {
      category,
      totalCount: stats.totalCount,
      exploredCount: stats.exploredCount,
      viewedCount: stats.viewedCount,
      favoriteCount: stats.favoriteCount,
      percent
    };
  });

  const totalSigns = catalog.length;
  const overallPercent =
    totalSigns > 0 ? Math.round((totalExplored / totalSigns) * 100) : 0;

  return {
    totalSigns,
    totalExplored,
    totalViewed,
    totalFavorites,
    overallPercent,
    categories
  };
}
