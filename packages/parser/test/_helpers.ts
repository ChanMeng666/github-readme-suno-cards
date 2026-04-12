import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'fixtures');

export function loadFixture<T = unknown>(name: string): T {
  const path = join(FIXTURES_DIR, name);
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

/**
 * Build a fake `fetch` that answers a single URL with a given JSON body and
 * status. Any other URL throws.
 */
export function mockFetchJson(expectedUrl: string | RegExp, status: number, body: unknown) {
  return async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof url === 'string' ? url : url.toString();
    const matches =
      typeof expectedUrl === 'string' ? urlStr === expectedUrl : expectedUrl.test(urlStr);
    if (!matches) {
      throw new Error(`mockFetchJson: unexpected URL ${urlStr} (expected ${expectedUrl})`);
    }
    void init;
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

/** Fake fetch that rejects every call with a given error. */
export function mockFetchError(err: unknown) {
  return async (): Promise<Response> => {
    throw err;
  };
}

/**
 * Fake fetch that responds based on a URL → {status, body} map. Falls back
 * to throwing on unknown URLs.
 */
export function mockFetchMap(
  map: Record<string, { status: number; body: unknown; location?: string }>,
) {
  return async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    void init;
    const urlStr = typeof url === 'string' ? url : url.toString();
    const entry = map[urlStr];
    if (!entry) {
      // Also try prefix match (useful for URLs with query strings)
      for (const [key, value] of Object.entries(map)) {
        if (urlStr.startsWith(key)) {
          return buildResponse(value);
        }
      }
      throw new Error(`mockFetchMap: no mock for ${urlStr}`);
    }
    return buildResponse(entry);
  };
}

function buildResponse(entry: { status: number; body: unknown; location?: string }): Response {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (entry.location) headers.location = entry.location;
  return new Response(entry.body == null ? null : JSON.stringify(entry.body), {
    status: entry.status,
    headers,
  });
}
