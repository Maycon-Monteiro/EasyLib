export type ParsedMediaKind = 'youtube' | 'image' | 'video';

export interface ParsedSignMedia {
  kind: ParsedMediaKind;
  url: string;
  videoId?: string;
}

export const DEFAULT_MEDIA_CREDIT = '';

export const URLS_CREDITOS: Record<string, string> = {};

const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeVideoId(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const seg = parsed.pathname.split('/').filter(Boolean)[0] || '';
      return YOUTUBE_ID_REGEX.test(seg) ? seg : null;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts[0] === 'shorts' || pathParts[0] === 'embed' || pathParts[0] === 'live') {
        const candidate = pathParts[1] || '';
        return YOUTUBE_ID_REGEX.test(candidate) ? candidate : null;
      }
      const vParam = parsed.searchParams.get('v') || '';
      return YOUTUBE_ID_REGEX.test(vParam) ? vParam : null;
    }
  } catch {
    const fallbackMatch = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:shorts\/|embed\/|watch\?v=))([A-Za-z0-9_-]{11})/
    );
    return fallbackMatch?.[1] || null;
  }

  return null;
}

export function isImageMediaUrl(rawUrl?: string): boolean {
  if (!rawUrl) return false;
  return /\.(webp|png|jpe?g|gif|avif|svg)(\?.*)?$/i.test(rawUrl.trim());
}

export function parseSignMedia(rawUrl?: string): ParsedSignMedia | null {
  const url = (rawUrl || '').trim();
  if (!url) return null;

  const ytId = extractYouTubeVideoId(url);
  if (ytId) {
    return { kind: 'youtube', url, videoId: ytId };
  }

  if (isImageMediaUrl(url)) {
    return { kind: 'image', url };
  }

  return { kind: 'video', url };
}

export function getYouTubeEmbedUrl(
  videoId: string,
  opts: {
    autoplay?: boolean;
    mute?: boolean;
    loop?: boolean;
    controls?: boolean;
  } = {}
): string {
  const {
    autoplay = true,
    mute = true,
    loop = true,
    controls = false
  } = opts;

  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: mute ? '1' : '0',
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    controls: controls ? '1' : '0'
  });

  if (loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function getMediaCreditLabel(rawUrl?: string, explicitCredit?: string): string {
  if (explicitCredit && explicitCredit.trim()) {
    return explicitCredit.trim();
  }
  const url = (rawUrl || '').trim();
  if (!url) return '';
  return URLS_CREDITOS[url] || '';
}
