import { type FetchClipOptions, fetchClip } from './clip.js';
import { SunoInvalidInputError, SunoNetworkError, SunoSchemaError } from './errors.js';
import { type FilterRankOptions, filterAndRank } from './filters.js';
import { normalizeInput } from './normalize.js';
import { fetchOEmbed } from './oembed.js';
import {
  type FetchProfilePageOptions,
  fetchProfilePage,
  fetchProfile as fetchProfileSummary,
} from './profile.js';
import { type FetchAllClipsOptions, fetchAllClips as fetchAllClipsRaw } from './profileAll.js';
import { resolveShortCode } from './resolver.js';
import type { SunoProfile, SunoSong } from './schema.js';

export * from './errors.js';
export * from './schema.js';
export { filterAndRank } from './filters.js';
export { classifyTags, splitTags } from './tags.js';
export { normalizeInput } from './normalize.js';
export { resolveShortCode } from './resolver.js';
export { fetchProfilePage } from './profile.js';
export { mapClipToSong } from './mapping.js';
export { fetchPlaylist, fetchPlaylistDetailUrl, type FetchPlaylistOptions } from './playlist.js';
export { fetchTrending } from './trending.js';

/**
 * Convenience wrapper: accept any normalized input form that resolves to a
 * playlist UUID and fetch it. Accepts either a bare UUID treated as a playlist
 * or a `suno.com/playlist/{uuid}` URL. Rejects song/handle/shortcode inputs.
 */
export async function fetchPlaylistByInput(
  input: string,
  opts: import('./playlist.js').FetchPlaylistOptions = {},
): Promise<import('./schema.js').SunoPlaylistDetail> {
  const normalized = normalizeInput(input);
  let uuid: string;
  switch (normalized.kind) {
    case 'playlistUuid':
      uuid = normalized.uuid;
      break;
    case 'uuid':
      // Bare UUIDs default to clip interpretation (§9 cross-table); caller
      // explicitly asked for playlist, so allow override here.
      uuid = normalized.uuid;
      break;
    case 'handle':
    case 'shortCode':
      throw new SunoInvalidInputError(input);
  }
  const { fetchPlaylist } = await import('./playlist.js');
  return fetchPlaylist(uuid, opts);
}

/**
 * Fetch a single Suno song. Accepts any known input form:
 *   - Bare UUID
 *   - `https://suno.com/song/{uuid}`
 *   - `https://suno.com/embed/{uuid}`
 *   - `https://suno.com/s/{shortcode}`
 *   - Bare short code (e.g. `Fgjo6R52kPsRs16o`)
 *
 * Handle-only inputs are rejected — use `fetchAllClips` instead.
 */
export async function fetchSong(input: string, opts: FetchClipOptions = {}): Promise<SunoSong> {
  const normalized = normalizeInput(input);

  let uuid: string;
  switch (normalized.kind) {
    case 'uuid':
      uuid = normalized.uuid;
      break;
    case 'shortCode':
      uuid = await resolveShortCode(normalized.shortCode, { fetchImpl: opts.fetchImpl });
      break;
    case 'handle':
    case 'playlistUuid':
      // /api/profiles and /api/playlist are disjoint ID namespaces from /api/clip.
      // Handle inputs should use fetchAllClips; playlist URLs should use fetchPlaylist.
      throw new SunoInvalidInputError(input);
  }

  // Primary path: /api/clip/
  try {
    return await fetchClip(uuid, opts);
  } catch (err) {
    // Degrade to oEmbed ONLY for network/schema failures — preserve semantic errors
    if (err instanceof SunoNetworkError || err instanceof SunoSchemaError) {
      return await fetchOEmbed(uuid, opts);
    }
    throw err;
  }
}

/** Fetch just the profile summary (no clips). */
export async function fetchProfile(
  handle: string,
  opts: FetchProfilePageOptions = {},
): Promise<SunoProfile> {
  return fetchProfileSummary(handle, opts);
}

export type FetchAllClipsCombinedOptions = FetchAllClipsOptions & FilterRankOptions;

/**
 * The flagship API: fetch a user's entire public library, filter, rank, cap.
 * This is what the GitHub Action calls in auto-discovery mode and what the
 * web service's `/api/cards?handle=...` route calls.
 */
export async function fetchAllClips(
  handle: string,
  opts: FetchAllClipsCombinedOptions = {},
): Promise<{ profile: SunoProfile; clips: SunoSong[] }> {
  const raw = await fetchAllClipsRaw(handle, {
    ...opts,
    // Fetch enough to survive filtering: request 2× the cap (or all if smaller)
    maxClips:
      opts.max != null && opts.maxClips == null ? Math.max(opts.max * 2, 20) : opts.maxClips,
  });

  const clips = filterAndRank(raw.clips, opts);
  return { profile: raw.profile, clips };
}
