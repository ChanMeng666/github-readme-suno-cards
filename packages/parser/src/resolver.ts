import { SunoInvalidInputError, SunoNetworkError } from './errors.js';

const UUID_IN_URL_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const SHORT_URL_BASE = 'https://suno.com/s/';

/** LRU-ish cache, but shortcodes are immutable so we never evict. */
const shortCodeCache = new Map<string, string>();

export type ResolveShortCodeOptions = {
  fetchImpl?: typeof fetch;
  /** Override for testing; defaults to Suno's production host. */
  urlBase?: string;
};

/**
 * Resolves a Suno share short code to its canonical UUID by issuing a HEAD
 * request with manual redirect handling and reading the `Location` header.
 *
 * The endpoint returns 307 with `Location: /song/{uuid}?sh=<code>` (verified
 * during P0 probing against `Fgjo6R52kPsRs16o`).
 */
export async function resolveShortCode(
  shortCode: string,
  opts: ResolveShortCodeOptions = {},
): Promise<string> {
  const cached = shortCodeCache.get(shortCode);
  if (cached) return cached;

  const fetchImpl = opts.fetchImpl ?? fetch;
  const url = `${opts.urlBase ?? SHORT_URL_BASE}${encodeURIComponent(shortCode)}`;

  let res: Response;
  try {
    res = await fetchImpl(url, {
      method: 'HEAD',
      redirect: 'manual',
    });
  } catch (cause) {
    throw new SunoNetworkError(url, cause);
  }

  // 307/302/301 — Suno uses 307 in prod
  if (res.status < 300 || res.status >= 400) {
    throw new SunoInvalidInputError(shortCode);
  }
  const location = res.headers.get('location');
  if (!location) throw new SunoInvalidInputError(shortCode);

  const match = location.match(UUID_IN_URL_RE);
  if (!match) throw new SunoInvalidInputError(shortCode);

  const uuid = match[0].toLowerCase();
  shortCodeCache.set(shortCode, uuid);
  return uuid;
}

/** Exposed for test isolation. */
export function _clearShortCodeCache(): void {
  shortCodeCache.clear();
}
