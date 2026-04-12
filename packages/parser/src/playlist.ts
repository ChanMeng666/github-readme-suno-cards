import * as v from 'valibot';
import { STUDIO_API_BASE } from './clip.js';
import { SunoHandleNotFoundError, SunoNotFoundError, SunoSchemaError } from './errors.js';
import { type FetchJsonOptions, fetchJson } from './fetcher.js';
import { mapClipToSong } from './mapping.js';
import {
  type PlaylistDetailResponse,
  PlaylistDetailSchema,
  type SunoPlaylistDetail,
  type SunoSong,
} from './schema.js';

export type FetchPlaylistOptions = FetchJsonOptions & {
  /** 1-indexed page number, 50 clips per page. */
  page?: number;
  /** Override source tag on each mapped clip. */
  source?: SunoSong['source'];
};

/**
 * Fetch a playlist's detail page from `/api/playlist/{uuid}` or `/api/trending`.
 *
 * Fetch a playlist from Suno's public API.
 * Pagination is `?page=N` with **50 clips per page** (contrast with
 * /api/profiles/ which returns 20 per page).
 *
 * Both endpoints share the same response shape, so this function is reused by
 * `fetchTrending()` in trending.ts.
 */
export async function fetchPlaylistDetailUrl(
  url: string,
  opts: FetchPlaylistOptions = {},
): Promise<SunoPlaylistDetail> {
  const fullUrl = opts.page != null ? `${url}?page=${encodeURIComponent(String(opts.page))}` : url;
  const cacheKey = fullUrl.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

  const { status, body } = await fetchJson<unknown>(fullUrl, {
    ...opts,
    cacheTags: opts.cacheTags ?? [`suno-${cacheKey}`],
    revalidateSeconds: opts.revalidateSeconds ?? 3600,
  });

  if (status === 404) throw new SunoNotFoundError(fullUrl);
  if (status === 422) throw new SunoHandleNotFoundError(fullUrl);
  if (status < 200 || status >= 300) {
    throw new SunoSchemaError(fullUrl, { status }, body);
  }

  const result = v.safeParse(PlaylistDetailSchema, body);
  if (!result.success) {
    throw new SunoSchemaError(fullUrl, result.issues, body);
  }

  return mapPlaylistDetail(result.output, opts.source ?? 'playlist');
}

/** Fetch a user-owned playlist by UUID from `/api/playlist/{uuid}`. */
export function fetchPlaylist(
  playlistId: string,
  opts: FetchPlaylistOptions = {},
): Promise<SunoPlaylistDetail> {
  const url = `${STUDIO_API_BASE}/api/playlist/${encodeURIComponent(playlistId)}`;
  return fetchPlaylistDetailUrl(url, { ...opts, source: opts.source ?? 'playlist' });
}

function mapPlaylistDetail(
  raw: PlaylistDetailResponse,
  source: SunoSong['source'],
): SunoPlaylistDetail {
  // Sort by relative_index ascending — Suno already returns them in order,
  // but we sort defensively so downstream code doesn't depend on server order.
  const wrappers = [...raw.playlist_clips].sort((a, b) => a.relative_index - b.relative_index);

  // Filter + map each clip through the same pipeline as /api/clip/.
  // Playlist clips can include not-ready / private songs — skip them so the
  // rendered list always contains playable entries.
  const clips: SunoSong[] = [];
  for (const { clip } of wrappers) {
    if (!clip.is_public) continue;
    if (clip.status !== 'complete') continue;
    clips.push(mapClipToSong(clip, source));
  }

  const owner =
    raw.user_handle != null || raw.user_display_name != null
      ? {
          displayName: raw.user_display_name ?? '',
          handle: raw.user_handle ?? null,
          avatarUrl: raw.user_avatar_image_url ?? null,
        }
      : null;

  return {
    id: raw.id,
    name: raw.name ?? '',
    description: raw.description ?? '',
    imageUrl: raw.image_url ?? null,
    isDiscover: raw.is_discover_playlist === true,
    numTotalTracks: raw.num_total_results,
    currentPage: raw.current_page ?? 1,
    clips,
    owner,
    shareUrl: owner?.handle ? `https://suno.com/playlist/${raw.id}` : null,
    source: source === 'playlist' || source === 'trending' ? source : 'playlist',
  };
}
