import {
  buildSignVideoUrl,
  LIBRAS_CATALOG_FULL,
  LIBRAS_SE_VIDEO_BASE_URL,
  LibrasCatalogCategory
} from './librasCatalog255';
import { inferGrammaticalClass } from './signEditorialDetails';

export interface SignDataItem {
  id: number;
  label: string;
  slug: string;
  videoUrl: string;
  category: LibrasCatalogCategory;
  grammarClass: string;
}

/**
 * Monta a URL do vídeo de um sinal do libras.se de forma programática a partir do slug.
 * URLs customizadas podem ser sobrescritas exclusivamente no código via `URLS_REAIS` em `librasCatalog255.ts`.
 */
export function buildLibrasSeSignVideoUrl(
  slug: string,
  label = '',
  baseUrl = LIBRAS_SE_VIDEO_BASE_URL
): string {
  const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, '');
  if (baseUrl === LIBRAS_SE_VIDEO_BASE_URL) {
    return buildSignVideoUrl(cleanSlug, label);
  }
  const cleanBase = baseUrl.replace(/\/+$/g, '');
  return `${cleanBase}/${cleanSlug}.mp4`;
}

export const SIGNS_DATA: SignDataItem[] = LIBRAS_CATALOG_FULL.map((sign) => ({
  id: sign.numericId,
  label: sign.palavra,
  slug: sign.slug,
  videoUrl: buildLibrasSeSignVideoUrl(sign.slug, sign.palavra),
  category: sign.categoria,
  grammarClass: inferGrammaticalClass(sign)
}));

const SIGNS_DATA_BY_SLUG = new Map<string, SignDataItem>(
  SIGNS_DATA.map((item) => [item.slug, item])
);

const SIGNS_DATA_BY_ID = new Map<number, SignDataItem>(
  SIGNS_DATA.map((item) => [item.id, item])
);

export function getSignDataBySlug(slug: string): SignDataItem | undefined {
  return SIGNS_DATA_BY_SLUG.get(slug.trim());
}

export function getSignDataById(id: number): SignDataItem | undefined {
  return SIGNS_DATA_BY_ID.get(id);
}
