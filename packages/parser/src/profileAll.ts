import { MAX_SKIPPED_ISSUES } from './clipList.js';
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
  /** Clips dropped across every fetched page because they failed validation. */
  skippedClips: number;
  /** Dotted issue paths for the first few skipped clips. */
  skippedIssues: string[];
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
  let skippedClips = 0;
  const skippedIssues: string[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const result = await fetchProfilePage(handle, {
      ...opts,
      clipsSortBy: sortBy,
      playlistsSortBy: sortBy,
      page,
    });

    if (profile === null) profile = result.profile;
    skippedClips += result.skippedClips;
    for (const issue of result.skippedIssues) {
      if (skippedIssues.length < MAX_SKIPPED_ISSUES) skippedIssues.push(issue);
    }

    if (result.clips.length === 0 && result.skippedClips === 0) break;
    accumulated.push(...result.clips);

    // Skipped clips still count towards the total, or a page with a dropped
    // clip would make the loop fetch one page past the end.
    if (accumulated.length + skippedClips >= result.numTotalClips) break;
    if (accumulated.length >= maxClips) break;
  }

  if (profile === null) {
    // Unreachable in practice — first iteration either throws or sets profile
    throw new Error(`fetchAllClips: profile never populated for ${handle}`);
  }

  return {
    profile,
    clips: maxClips === Number.POSITIVE_INFINITY ? accumulated : accumulated.slice(0, maxClips),
    skippedClips,
    skippedIssues,
  };
}
