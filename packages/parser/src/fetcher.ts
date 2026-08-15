import { SunoNetworkError } from './errors.js';

/**
 * A single, honest User-Agent that names this project and links to it.
 *
 * Suno's `studio-api-prod.suno.com` host does not gate on User-Agent, so there
 * is nothing to be gained by pretending to be a browser — and a tool that reads
 * a public API should say what it is. Keep the version in step with the latest
 * release heading in `CHANGELOG.md`.
 */
const USER_AGENT =
  'github-readme-suno-cards/0.2.0 (+https://github.com/ChanMeng666/github-readme-suno-cards)';

export type FetchJsonOptions = {
  /** Override fetch implementation (test injection). */
  fetchImpl?: typeof fetch;
  /** Request timeout in ms. Default 10_000. */
  timeoutMs?: number;
  /** Number of retry attempts on 5xx/429. Default 1. */
  retries?: number;
  /** Pass-through signal for route-level cancellation. */
  signal?: AbortSignal;
  /**
   * Next.js fetch-cache hint forwarded verbatim on Vercel Edge.
   * Ignored by plain `fetch` in other environments (GitHub Actions node).
   */
  revalidateSeconds?: number;
  cacheTags?: string[];
};

export type FetchJsonResult<T = unknown> = {
  status: number;
  body: T | null;
};

/**
 * Low-level JSON fetch with timeout, retry, and Vercel Data Cache passthrough.
 * Returns `{status, body}` — does NOT throw on non-2xx (callers map codes to
 * typed errors). Throws only on network failure / timeout / parse error after
 * exhausting retries.
 */
export async function fetchJson<T = unknown>(
  url: string,
  opts: FetchJsonOptions = {},
): Promise<FetchJsonResult<T>> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? 10_000;
  const totalAttempts = 1 + (opts.retries ?? 1);

  let lastError: unknown = null;

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    // Link caller's signal if provided
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      else opts.signal.addEventListener('abort', () => controller.abort(), { once: true });
    }

    try {
      // Vercel Data Cache hint — extra keys on init are harmless in non-Next fetch impls
      const init: RequestInit & {
        next?: { revalidate?: number; tags?: string[] };
      } = {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      };
      if (opts.revalidateSeconds != null || opts.cacheTags) {
        init.next = {
          ...(opts.revalidateSeconds != null && { revalidate: opts.revalidateSeconds }),
          ...(opts.cacheTags && { tags: opts.cacheTags }),
        };
      }

      const res = await fetchImpl(url, init);
      clearTimeout(timer);

      // Retry on transient 5xx / 429 — the retry loop goes around again
      if ((res.status >= 500 || res.status === 429) && attempt + 1 < totalAttempts) {
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }

      // Non-retriable status → return raw for caller to map
      if (res.status < 200 || res.status >= 300) {
        return { status: res.status, body: null };
      }

      const body = (await res.json()) as T;
      return { status: res.status, body };
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      if (attempt + 1 >= totalAttempts) break;
      // else: loop for retry
    }
  }

  throw new SunoNetworkError(url, lastError);
}
