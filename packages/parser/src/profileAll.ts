import type { FetchJsonOptions } from './fetcher.js';
import { fetchProfilePage } from './profile.js';
import type { SortKey, SunoProfile, SunoSong } from './schema.js';

export type FetchAllClipsOptions = FetchJsonOptions & {
  sortBy?: SortKey;
  /** Max pages to fetch (safety valve). Default 10 → up to 200 clips. */
  maxPagesToFetch?: number;
  /** Stop paginating once this many clips are accumulated. */
  maxClips?: number;
};

export type FetchAllClipsResult = {
  profile: SunoProfile;
  clips: SunoSong[];
};

/**
 * Loop `/api/profiles/{handle}` across pages until either:
 *   - accumulated clips.length >= profile.totalClips  (all fetched)
 *   - accumulated clips.length >= opts.maxClips       (user cap hit)
 *   - pagesFetched >= opts.maxPagesToFetch            (safety valve hit)
 *   - server returns an empty page                    (defensive)
 */
export async function fetchAllClips(
  handle: string,
  opts: FetchAllClipsOptions = {},
): Promise<FetchAllClipsResult> {
  const sortBy = opts.sortBy ?? 'created_at';
  const maxPages = opts.maxPagesToFetch ?? 10;
  const maxClips = opts.maxClips ?? Number.POSITIVE_INFINITY;

  const accumulated: SunoSong[] = [];
  let profile: SunoProfile | null = null;

  for (let page = 1; page <= maxPages; page++) {
    const result = await fetchProfilePage(handle, {
      ...opts,
      clipsSortBy: sortBy,
      playlistsSortBy: sortBy,
      page,
    });

    if (profile === null) profile = result.profile;

    if (result.clips.length === 0) break;
    accumulated.push(...result.clips);

    if (accumulated.length >= result.numTotalClips) break;
    if (accumulated.length >= maxClips) break;
  }

  if (profile === null) {
    // Unreachable in practice — first iteration either throws or sets profile
    throw new Error(`fetchAllClips: profile never populated for ${handle}`);
  }

  return {
    profile,
    clips: maxClips === Number.POSITIVE_INFINITY ? accumulated : accumulated.slice(0, maxClips),
  };
}
