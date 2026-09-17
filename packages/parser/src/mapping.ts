import type { BadgeTheme, ClipResponse, ClipStatus, SecondaryBadge, SunoSong } from './schema.js';
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

type BadgeSide = NonNullable<
  NonNullable<NonNullable<ClipResponse['metadata']['model_badges']>['songrow']>['light']
>;

function mapBadgeSide(side: BadgeSide): BadgeTheme {
  const stops = side.text_color_gradient ?? [];
  return {
    text: hexToCss(side.text_color),
    bg: side.background_color != null ? hexToCss(side.background_color) : null,
    border: side.border_color != null ? hexToCss(side.border_color) : null,
    gradient: stops.length > 0 ? stops.map(hexToCss) : null,
  };
}

/**
 * Return `url` if it is a real, fetchable http(s) media URL, else `null`.
 *
 * Suno replaced the public mp3 in `audio_url` with the placeholder
 * `https://studio-api.prod.suno.com/api/forbidden` in early September 2026.
 * That is a well-formed URL, so "is it a string" is no longer a useful check —
 * anything whose path is `/api/forbidden`, or which is not http(s), maps to null.
 */
export function normalizeMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (parsed.pathname.replace(/\/+$/, '') === '/api/forbidden') return null;
  return url;
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function mapSecondaryBadges(
  raw: ClipResponse['metadata']['secondary_badges'],
): SecondaryBadge[] | null {
  if (raw == null) return null;
  const out: SecondaryBadge[] = [];
  for (const badge of raw) {
    const keySource = badge.icon_key ?? badge.display_name;
    if (!keySource) continue;
    const labelSource = badge.display_name ?? keySource.replace(/_/g, ' ');
    out.push({ key: keySource.toLowerCase(), label: titleCase(labelSource) });
  }
  return out;
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

  // `songrow` first: it is the badge this card has always drawn. `songcard`
  // only fills in when a clip has no row badge at all.
  const badges = clip.metadata.model_badges?.songrow ?? clip.metadata.model_badges?.songcard;
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
    audioUrl: normalizeMediaUrl(clip.audio_url),
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
    secondaryBadges: mapSecondaryBadges(clip.metadata.secondary_badges),
    shareUrl: `${SONG_URL_BASE}${clip.id}`,
    embedUrl: `${EMBED_URL_BASE}${clip.id}`,
    source,
  };
}
