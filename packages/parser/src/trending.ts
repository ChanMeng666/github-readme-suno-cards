import { STUDIO_API_BASE } from './clip.js';
import { type FetchPlaylistOptions, fetchPlaylistDetailUrl } from './playlist.js';
import type { SunoPlaylistDetail } from './schema.js';

/**
 * Fetch Suno's "Explore" editorial playlist from `/api/trending`.
 *
 * Returns a `Playlist` object with `name: "Explore"` and ~49 inlined clip
 * wrappers. Shape is identical to `/api/playlist/{uuid}` minus the `user_*`
 * fields and `next_cursor`.
 */
export function fetchTrending(opts: FetchPlaylistOptions = {}): Promise<SunoPlaylistDetail> {
  return fetchPlaylistDetailUrl(`${STUDIO_API_BASE}/api/trending`, {
    ...opts,
    source: 'trending',
  });
}
