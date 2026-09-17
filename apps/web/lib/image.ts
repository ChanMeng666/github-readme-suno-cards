import { resizeSunoCover } from '@suno-cards/parser';

/**
 * Fetch a remote image and return it as a base64 data URI, suitable for
 * embedding directly in an <image> element inside an SVG.
 *
 * Runs on Vercel Edge runtime with native fetch. Not routed through Next's
 * data cache — see the note on `cache: 'no-store'` below; the finished SVG is
 * what gets cached, at the CDN.
 */

export type FetchImageOptions = {
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
  'github-readme-suno-cards/0.3.0 (+https://github.com/ChanMeng666/github-readme-suno-cards)';

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

  const timeoutMs = opts.timeoutMs ?? 6000;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // The abort signal alone was not enough: a hung body read outlived it, so the
  // whole operation also races a timer that settles to `null` (placeholder
  // cover) instead of letting the route run into Vercel's 25s Edge limit.
  const timedOut = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, timeoutMs);
  });
  const fetchImpl = opts.fetchImpl ?? fetch;

  try {
    return await Promise.race([load(), timedOut]);
  } finally {
    clearTimeout(timer);
  }

  async function load(): Promise<string | null> {
    try {
      const init: RequestInit = {
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
        // Deliberately NOT cached in Next's data cache. Measured 2026-09-17 on
        // Vercel Edge (production and preview alike): the first render of a card
        // succeeded in ~1s and every repeat request for the same cover hung until
        // the platform's 25s limit and returned 504 — a cold cover URL (player
        // layout, different ?width) worked exactly once, then failed the same
        // way. The rendered SVG is already CDN-cached via s-maxage (see
        // `svgResponse`), and a resized cover is ~20-50 KB, so the data cache
        // bought little here and cost every warm request.
        cache: 'no-store',
      };

      const res = await fetchImpl(target, init);
      if (!res.ok) return null;

      const contentType = res.headers.get('content-type') ?? FALLBACK_CONTENT_TYPE;
      const buffer = await res.arrayBuffer();
      const base64 = bufferToBase64(buffer);
      return `data:${contentType};base64,${base64}`;
    } catch {
      return null;
    }
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
