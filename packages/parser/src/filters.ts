import type { SortKey, SunoSong } from './schema.js';

export type FilterRankOptions = {
  sortBy?: SortKey;
  max?: number;
  includeTags?: string[];
  excludeTags?: string[];
  minDurationSeconds?: number;
  maxDurationSeconds?: number;
  minPlays?: number;
  minLikes?: number;
  pinnedFirst?: boolean;
  hidePrivate?: boolean;
  hideNotReady?: boolean;
  allowExplicit?: boolean;
  featured?: string[];
};

function hasAnyTag(song: SunoSong, needles: string[]): boolean {
  if (needles.length === 0) return false;
  const hay = song.tags.map((t) => t.toLowerCase());
  return needles.some((n) => {
    const needle = n.toLowerCase();
    return hay.some((tag) => tag.includes(needle));
  });
}

const sortComparators: Record<SortKey, (a: SunoSong, b: SunoSong) => number> = {
  created_at: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  play_count: (a, b) => b.playCount - a.playCount,
  upvote_count: (a, b) => b.likeCount - a.likeCount,
  name: (a, b) => a.title.localeCompare(b.title),
};

/**
 * Apply user filters and ranking to a list of songs. Pure function.
 *
 * Order of operations:
 *   1. Drop private (unless disabled)
 *   2. Drop not-ready (unless disabled)
 *   3. Drop explicit (if disallowed)
 *   4. Apply include_tags / exclude_tags
 *   5. Apply duration/plays/likes floors
 *   6. Sort by sortBy
 *   7. Lift featured UUIDs to the top (stable order within the featured list)
 *   8. Lift pinned above the rest (stable order)
 *   9. Cap to `max`
 */
export function filterAndRank(input: SunoSong[], opts: FilterRankOptions = {}): SunoSong[] {
  const {
    sortBy = 'created_at',
    max,
    includeTags,
    excludeTags,
    minDurationSeconds,
    maxDurationSeconds,
    minPlays,
    minLikes,
    pinnedFirst = true,
    hidePrivate = true,
    hideNotReady = true,
    allowExplicit = true,
    featured,
  } = opts;

  let pool = input.slice();

  if (hidePrivate) pool = pool.filter((s) => s.isPublic);
  if (hideNotReady) pool = pool.filter((s) => s.status === 'complete');
  if (!allowExplicit) pool = pool.filter((s) => !s.explicit);

  if (includeTags && includeTags.length > 0) {
    pool = pool.filter((s) => hasAnyTag(s, includeTags));
  }
  if (excludeTags && excludeTags.length > 0) {
    pool = pool.filter((s) => !hasAnyTag(s, excludeTags));
  }

  if (minDurationSeconds != null) {
    pool = pool.filter((s) => s.durationSeconds >= minDurationSeconds);
  }
  if (maxDurationSeconds != null) {
    pool = pool.filter((s) => s.durationSeconds <= maxDurationSeconds);
  }
  if (minPlays != null) pool = pool.filter((s) => s.playCount >= minPlays);
  if (minLikes != null) pool = pool.filter((s) => s.likeCount >= minLikes);

  pool.sort(sortComparators[sortBy]);

  // Featured: lift the named UUIDs to the top in the order they appear in
  // the featured array, preserving relative order of the rest.
  if (featured && featured.length > 0) {
    const featuredSet = new Set(featured);
    const featuredItems = featured
      .map((id) => pool.find((s) => s.id === id))
      .filter((s): s is SunoSong => s !== undefined);
    const rest = pool.filter((s) => !featuredSet.has(s.id));
    pool = [...featuredItems, ...rest];
  }

  // Pinned-first: stable partition
  if (pinnedFirst) {
    const pinned = pool.filter((s) => s.isPinned);
    const rest = pool.filter((s) => !s.isPinned);
    pool = [...pinned, ...rest];
  }

  return max != null ? pool.slice(0, max) : pool;
}
