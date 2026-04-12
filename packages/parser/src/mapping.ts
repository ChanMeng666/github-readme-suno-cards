import type { BadgeTheme, ClipResponse, ClipStatus, SunoSong } from './schema.js';
import { classifyTags, splitTags } from './tags.js';

const SONG_URL_BASE = 'https://suno.com/song/';
const EMBED_URL_BASE = 'https://suno.com/embed/';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function parseStatus(raw: string): ClipStatus {
  if (
    raw === 'complete' ||
    raw === 'streaming' ||
    raw === 'submitted' ||
    raw === 'queued' ||
    raw === 'error'
  ) {
    return raw;
  }
  return 'error';
}

/** Convert a `#RRGGBB` or 8-char ARGB hex into a CSS rgba() string. */
function hexToCss(hex: string): string {
  const cleaned = hex.replace(/^#/, '').trim();
  if (cleaned.length === 6) return `#${cleaned}`;
  if (cleaned.length === 8) {
    const r = Number.parseInt(cleaned.slice(0, 2), 16);
    const g = Number.parseInt(cleaned.slice(2, 4), 16);
    const b = Number.parseInt(cleaned.slice(4, 6), 16);
    const a = Number.parseInt(cleaned.slice(6, 8), 16) / 255;
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
  }
  return `#${cleaned}`;
}

function mapBadgeSide(side: {
  text_color: string;
  background_color: string;
  border_color: string;
}): BadgeTheme {
  return {
    text: hexToCss(side.text_color),
    bg: hexToCss(side.background_color),
    border: hexToCss(side.border_color),
  };
}

/**
 * Map a raw `ClipResponse` (validated Valibot output) to the project's
 * `SunoSong` normalized type. Pure function, no I/O.
 */
export function mapClipToSong(
  clip: ClipResponse,
  source: SunoSong['source'],
  nowMs: number = Date.now(),
): SunoSong {
  const tags = splitTags(clip.metadata.tags);
  const classifiedTags = classifyTags(tags);

  const createdAtMs = Date.parse(clip.created_at);
  const isNew = Number.isFinite(createdAtMs) && nowMs - createdAtMs < SEVEN_DAYS_MS;

  const badges = clip.metadata.model_badges?.songrow;
  const modelBadgeTheme =
    badges?.light && badges?.dark
      ? { light: mapBadgeSide(badges.light), dark: mapBadgeSide(badges.dark) }
      : null;

  return {
    id: clip.id,
    title: clip.title ?? '',
    status: parseStatus(clip.status),
    isPublic: clip.is_public,
    isPinned: clip.is_pinned ?? false,
    explicit: clip.explicit ?? false,
    author: {
      displayName: clip.display_name ?? '',
      handle: clip.handle,
      avatarUrl: clip.avatar_image_url,
      userId: clip.user_id,
    },
    coverUrl: clip.image_url,
    coverLargeUrl: clip.image_large_url,
    audioUrl: clip.audio_url,
    videoUrl: clip.video_url ?? null,
    tags,
    classifiedTags,
    lyrics: clip.metadata.prompt ?? null,
    durationSeconds: clip.metadata.duration ?? 0,
    playCount: clip.play_count,
    likeCount: clip.upvote_count,
    commentCount: clip.comment_count ?? 0,
    createdAt: clip.created_at,
    isNew,
    modelVersion: clip.major_model_version,
    modelName: clip.model_name,
    modelBadgeTheme,
    shareUrl: `${SONG_URL_BASE}${clip.id}`,
    embedUrl: `${EMBED_URL_BASE}${clip.id}`,
    source,
  };
}
