import { resizeSunoCover } from '@suno-cards/parser';

/**
 * Fetch a remote image and return it as a base64 data URI, suitable for
 * embedding directly in an <image> element inside an SVG.
 *
 * Runs on Vercel Edge runtime — uses native fetch with Next.js's Vercel
 * Data Cache hint (`next.revalidate`) so warm requests are served from
 * Vercel's shared edge cache instead of re-hitting Suno's CDN every time.
 */

export type FetchImageOptions = {
  /** Revalidation window in seconds. Default 1 hour. */
  revalidate?: number;
  /** Abort the fetch after N ms. Default 6s — images are the slow path. */
  timeoutMs?: number;
  /** Optional fetch impl override (for tests). */
  fetchImpl?: typeof fetch;
  /**
   * The width this asset will actually be RENDERED at, in CSS pixels. When set,
   * a Suno cover URL is rewritten to request a matching size instead of the
   * full-size original — cards draw covers at 120-130px, so fetching the
   * original was pure wasted bytes on every cold request.
   *
   * Pass the logical size; `resizeSunoCover` handles the 2x and the snapping to
   * Suno's whitelist (an arbitrary `?width=` is a 403, not a smaller image).
   * Non-Suno URLs are unaffected.
   */
  renderWidth?: number;
};

const FALLBACK_CONTENT_TYPE = 'image/jpeg';

/**
 * Kept in step with the parser's User-Agent. Honest identification, correct
 * URL, and deliberately NOT beginning with `suno` — see packages/parser/src/fetcher.ts.
 */
const SUNO_CARDS_USER_AGENT =
  'github-readme-suno-cards/0.2.1 (+https://github.com/ChanMeng666/github-readme-suno-cards)';

/**
 * Fetch `url` and return a `data:*;base64,*` URI, or `null` if the asset
 * fails to load. Never throws — callers can render a placeholder on null.
 */
export async function fetchAsDataUri(
  url: string | null | undefined,
  opts: FetchImageOptions = {},
): Promise<string | null> {
  if (!url) return null;
  const target = opts.renderWidth ? resizeSunoCover(url, opts.renderWidth * 2) : url;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 6000);
  const fetchImpl = opts.fetchImpl ?? fetch;

  try {
    // The extra `next` key is Next.js-specific and ignored by plain fetch.
    const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'image/*,*/*',
        // One project-identifying User-Agent, matching the parser's (see the
        // note in packages/parser/src/fetcher.ts). Previously this was a
        // second, undocumented string whose URL pointed at the wrong GitHub
        // org and therefore 404'd — an asset fetch should still say honestly
        // who is asking, and say it correctly.
        'User-Agent': SUNO_CARDS_USER_AGENT,
      },
      next: { revalidate: opts.revalidate ?? 3600 },
    };

    const res = await fetchImpl(target, init);
    if (!res.ok) return null;

    const contentType = res.headers.get('content-type') ?? FALLBACK_CONTENT_TYPE;
    const buffer = await res.arrayBuffer();
    const base64 = bufferToBase64(buffer);
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Cross-runtime base64 encoder. Prefers Node's `Buffer` (available in Next.js
 * Edge runtime via polyfill), falls back to a chunked `btoa` loop for pure
 * Web Workers / non-Node environments.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  // biome-ignore lint/suspicious/noExplicitAny: runtime feature detection
  const g = globalThis as any;
  if (typeof g.Buffer !== 'undefined') {
    return g.Buffer.from(buffer).toString('base64');
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const slice = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}
