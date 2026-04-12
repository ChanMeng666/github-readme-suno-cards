import * as v from 'valibot';
import { SunoHandleNotFoundError, SunoSchemaError } from './errors.js';
import { type FetchJsonOptions, fetchJson } from './fetcher.js';
import { mapClipToSong } from './mapping.js';
import {
  ProfileResponseSchema,
  type SortKey,
  type SunoPlaylist,
  type SunoProfile,
  type SunoSong,
} from './schema.js';

import { STUDIO_API_BASE } from './clip.js';

const HANDLE_URL_BASE = 'https://suno.com/@';

export type FetchProfilePageOptions = FetchJsonOptions & {
  clipsSortBy?: SortKey;
  playlistsSortBy?: SortKey;
  page?: number;
};

export type FetchProfilePageResult = {
  profile: SunoProfile;
  clips: SunoSong[];
  numTotalClips: number;
  currentPage: number;
};

/**
 * Fetch a single page of `/api/profiles/{handle}`.
 *
 * Suno returns up to 20 clips per page. To retrieve a user's full library,
 * use `profileAll.ts` (which loops this function).
 */
export async function fetchProfilePage(
  handle: string,
  opts: FetchProfilePageOptions = {},
): Promise<FetchProfilePageResult> {
  const clipsSortBy = opts.clipsSortBy ?? 'created_at';
  const playlistsSortBy = opts.playlistsSortBy ?? 'created_at';
  const page = opts.page ?? 1;

  const search = new URLSearchParams({
    clips_sort_by: clipsSortBy,
    playlists_sort_by: playlistsSortBy,
    page: String(page),
  });
  const url = `${STUDIO_API_BASE}/api/profiles/${encodeURIComponent(handle)}?${search.toString()}`;

  const { status, body } = await fetchJson<unknown>(url, {
    ...opts,
    cacheTags: opts.cacheTags ?? [`suno-profile-${handle}-${clipsSortBy}-${page}`],
    revalidateSeconds: opts.revalidateSeconds ?? 600,
  });

  if (status === 404 || status === 422) throw new SunoHandleNotFoundError(handle);
  if (status < 200 || status >= 300) {
    throw new SunoSchemaError(url, { status }, body);
  }

  const result = v.safeParse(ProfileResponseSchema, body);
  if (!result.success) {
    throw new SunoSchemaError(url, result.issues, body);
  }
  const p = result.output;

  const playlists: SunoPlaylist[] = p.playlists.map((pl) => ({
    id: pl.id,
    name: pl.name ?? '',
    imageUrl: pl.image_url ?? null,
    numTracks: pl.num_total_results ?? 0,
    isPublic: pl.is_public ?? false,
  }));

  const profile: SunoProfile = {
    userId: p.user_id,
    handle: p.handle,
    displayName: p.display_name ?? '',
    avatarUrl: p.avatar_image_url,
    description: p.profile_description ?? '',
    isVerified: p.is_verified ?? false,
    totalClips: p.num_total_clips,
    stats: {
      totalPlays: p.stats.play_count__sum ?? 0,
      totalLikes: p.stats.upvote_count__sum ?? 0,
      followers: p.stats.followers_count ?? 0,
      following: p.stats.following_count ?? 0,
    },
    playlists,
    shareUrl: `${HANDLE_URL_BASE}${p.handle}`,
  };

  const clips = p.clips.map((c) => mapClipToSong(c, 'profile'));

  return {
    profile,
    clips,
    numTotalClips: p.num_total_clips,
    currentPage: p.current_page ?? page,
  };
}

/**
 * Summary-only fetch: returns just the `SunoProfile` (no clips) by calling
 * page 1 and discarding clips. Used by the `/api/profile` route handler.
 */
export async function fetchProfile(
  handle: string,
  opts: FetchProfilePageOptions = {},
): Promise<SunoProfile> {
  const { profile } = await fetchProfilePage(handle, opts);
  return profile;
}
