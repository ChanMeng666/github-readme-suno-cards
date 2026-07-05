import { STUDIO_API_BASE } from './clip.js';
import { type FetchPlaylistOptions, fetchPlaylistDetailUrl } from './playlist.js';
import type { SunoPlaylistDetail } from './schema.js';

/**
 * DEAD ENDPOINT — DO NOT BUILD ON THIS.
 *
 * `GET /api/trending` is NOT a live feed. It is an abandoned playlist object
 * (`1190bf92-10dc-4ce5-968a-7a377f37f984`, "Explore — Top 10 Songs") frozen at a
 * September-2024 snapshot: all ~49 clips carry `created_at` in 2024-09-15→17, the
 * body is byte-stable across fetches, and the origin (`Cf-Cache-Status: DYNAMIC`)
 * serves the same fossil every time. Suno's real Explore (post the 2026-05-14
 * "Explore Refresh") is curated-playlist based and shares ZERO clips with this
 * endpoint. Forensics + raw evidence:
 *   github-readme-suno-cards/docs/probes/2026-07-05-orphaned-endpoint/
 *
 * Kept only so the parser still round-trips the shape; it is intentionally NOT
 * re-exported from the package index. The README-roadmap "trending arrows" idea
 * must be built on a live source (Suno's curated Explore shelves), never here.
 *
 * @deprecated `/api/trending` is a 22-month-stale fossil. Any feature that treats
 *   its output as current data (e.g. "trending arrows") will be silently wrong.
 */
export function fetchTrending(opts: FetchPlaylistOptions = {}): Promise<SunoPlaylistDetail> {
  return fetchPlaylistDetailUrl(`${STUDIO_API_BASE}/api/trending`, {
    ...opts,
    source: 'trending',
  });
}
