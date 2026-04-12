import * as v from 'valibot';
import { SunoNotFoundError, SunoSchemaError } from './errors.js';
import { type FetchJsonOptions, fetchJson } from './fetcher.js';
import { OEmbedResponseSchema, type SunoSong } from './schema.js';

import { STUDIO_API_BASE } from './clip.js';

const SONG_URL_BASE = 'https://suno.com/song/';
const EMBED_URL_BASE = 'https://suno.com/embed/';

/**
 * Degraded fallback: fetch the oEmbed endpoint that Suno publishes as their
 * public API discovery surface. Only returns title + iframe/thumbnail; used
 * when `/api/clip/` is unavailable or schema-broken.
 *
 * Produces a `SunoSong` with most fields zeroed or synthesized from the UUID
 * (cover URL is derivable from the UUID pattern).
 */
export async function fetchOEmbed(uuid: string, opts: FetchJsonOptions = {}): Promise<SunoSong> {
  const songUrl = `${SONG_URL_BASE}${uuid}`;
  const url = `${STUDIO_API_BASE}/api/oembed?url=${encodeURIComponent(songUrl)}`;

  const { status, body } = await fetchJson<unknown>(url, {
    ...opts,
    cacheTags: opts.cacheTags ?? [`suno-oembed-${uuid}`],
    revalidateSeconds: opts.revalidateSeconds ?? 3600,
  });

  if (status === 404) throw new SunoNotFoundError(uuid);
  if (status < 200 || status >= 300) {
    throw new SunoSchemaError(url, { status }, body);
  }

  const result = v.safeParse(OEmbedResponseSchema, body);
  if (!result.success) throw new SunoSchemaError(url, result.issues, body);
  const o = result.output;

  return {
    id: uuid,
    title: o.title,
    status: 'complete',
    isPublic: true,
    isPinned: false,
    explicit: false,
    author: {
      displayName: o.author_name ?? '',
      handle: null,
      avatarUrl: null,
      userId: '',
    },
    coverUrl: o.thumbnail_url ?? `https://cdn2.suno.ai/image_${uuid}.jpeg`,
    coverLargeUrl: o.thumbnail_url ?? `https://cdn2.suno.ai/image_large_${uuid}.jpeg`,
    audioUrl: `https://cdn1.suno.ai/${uuid}.mp3`,
    videoUrl: null,
    tags: [],
    classifiedTags: {
      genre: [],
      era: [],
      instrument: [],
      mood: [],
      vocal: [],
      key: [],
      production: [],
      tempo: [],
      other: [],
    },
    lyrics: null,
    durationSeconds: 0,
    playCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: new Date(0).toISOString(),
    isNew: false,
    modelVersion: '',
    modelName: '',
    modelBadgeTheme: null,
    shareUrl: songUrl,
    embedUrl: `${EMBED_URL_BASE}${uuid}`,
    source: 'oembed',
  };
}
