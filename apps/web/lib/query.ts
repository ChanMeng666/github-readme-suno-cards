import type { SortKey } from '@suno-cards/parser';
import type { CardLayout } from '@suno-cards/render';
import type { ColorOverrides, Lang, PresetName, ThemeMode } from '@suno-cards/render';

/**
 * Query-parameter reader for the three route handlers.
 *
 * Query strings are always `Record<string, string>`, so Valibot's full
 * schema machinery is overkill — we just coerce each field with a tiny
 * helper and return a strongly-typed object. Required fields throw a
 * `QueryError` which the route handlers map to an error SVG.
 */

export class QueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QueryError';
  }
}

// ---------------------------------------------------------------------------
// Primitive readers
// ---------------------------------------------------------------------------

function readString(params: URLSearchParams, key: string): string | undefined {
  const v = params.get(key);
  if (v == null) return undefined;
  const trimmed = v.trim();
  return trimmed === '' ? undefined : trimmed;
}

function readRequired(params: URLSearchParams, key: string): string {
  const v = readString(params, key);
  if (!v) throw new QueryError(`Missing or empty \`${key}\` parameter`);
  return v;
}

function readBool(params: URLSearchParams, key: string): boolean | undefined {
  const v = readString(params, key);
  if (v == null) return undefined;
  const lower = v.toLowerCase();
  if (lower === 'true' || lower === '1' || lower === 'yes') return true;
  if (lower === 'false' || lower === '0' || lower === 'no') return false;
  return undefined;
}

function readInt(
  params: URLSearchParams,
  key: string,
  min: number,
  max: number,
): number | undefined {
  const v = readString(params, key);
  if (v == null) return undefined;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return undefined;
  return Math.min(Math.max(n, min), max);
}

function readCsv(params: URLSearchParams, key: string): string[] | undefined {
  const v = readString(params, key);
  if (!v) return undefined;
  const parts = v
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts : undefined;
}

function readTheme(params: URLSearchParams): ThemeMode | undefined {
  const v = readString(params, 'theme');
  if (v === 'dark' || v === 'light' || v === 'auto') return v;
  return undefined;
}

function readLang(params: URLSearchParams): Lang | undefined {
  const v = readString(params, 'lang');
  if (v === 'en' || v === 'zh' || v === 'ja') return v;
  return undefined;
}

function readLayout(params: URLSearchParams): CardLayout | undefined {
  const v = readString(params, 'layout');
  if (v === 'classic' || v === 'player') return v;
  return undefined;
}

function readPreset(params: URLSearchParams): PresetName | undefined {
  const v = readString(params, 'preset');
  if (v === 'default' || v === 'suno') return v;
  return undefined;
}

function readSort(params: URLSearchParams): SortKey | undefined {
  const v = readString(params, 'sort');
  if (v === 'created_at' || v === 'upvote_count' || v === 'play_count' || v === 'name') {
    return v;
  }
  return undefined;
}

function readHexColor(params: URLSearchParams, key: string): string | undefined {
  const v = readString(params, key);
  if (!v) return undefined;
  const cleaned = v.replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(cleaned) || /^[0-9a-fA-F]{8}$/.test(cleaned)) {
    return `#${cleaned}`;
  }
  return undefined;
}

function readColors(params: URLSearchParams): ColorOverrides {
  const out: ColorOverrides = {};
  const bg = readHexColor(params, 'bg_color');
  const text = readHexColor(params, 'text_color');
  const subtext = readHexColor(params, 'subtext_color');
  const accent = readHexColor(params, 'accent_color');
  const border = readHexColor(params, 'border_color');
  if (bg) out.bg = bg;
  if (text) out.text = text;
  if (subtext) out.subtext = subtext;
  if (accent) out.accent = accent;
  if (border) out.border = border;
  return out;
}

// ---------------------------------------------------------------------------
// /api/card?id=...
// ---------------------------------------------------------------------------

export type CardQuery = {
  id: string;
  layout: CardLayout | undefined;
  preset: PresetName | undefined;
  theme: ThemeMode | undefined;
  lang: Lang | undefined;
  width: number | undefined;
  colors: ColorOverrides;
  showPlays: boolean | undefined;
  showLikes: boolean | undefined;
  showDuration: boolean | undefined;
  showAuthor: boolean | undefined;
  showEqualizer: boolean | undefined;
  showModelBadge: boolean | undefined;
  showNewBadge: boolean | undefined;
  showTags: boolean | undefined;
  showProgress: boolean | undefined;
  showLogo: boolean | undefined;
  showLinkIcon: boolean | undefined;
  maxTags: number | undefined;
};

export function readCardQuery(params: URLSearchParams): CardQuery {
  return {
    id: readRequired(params, 'id'),
    layout: readLayout(params),
    preset: readPreset(params),
    theme: readTheme(params),
    lang: readLang(params),
    width: readInt(params, 'width', 200, 1200),
    colors: readColors(params),
    showPlays: readBool(params, 'show_plays'),
    showLikes: readBool(params, 'show_likes'),
    showDuration: readBool(params, 'show_duration'),
    showAuthor: readBool(params, 'show_author'),
    showEqualizer: readBool(params, 'show_equalizer'),
    showModelBadge: readBool(params, 'show_model_badge'),
    showNewBadge: readBool(params, 'show_new_badge'),
    showTags: readBool(params, 'show_tags'),
    showProgress: readBool(params, 'show_progress'),
    showLogo: readBool(params, 'show_logo'),
    showLinkIcon: readBool(params, 'show_link_icon'),
    maxTags: readInt(params, 'max_tags', 0, 20),
  };
}

// ---------------------------------------------------------------------------
// /api/profile?handle=...
// ---------------------------------------------------------------------------

export type ProfileQuery = {
  handle: string;
  theme: ThemeMode | undefined;
  lang: Lang | undefined;
  width: number | undefined;
  colors: ColorOverrides;
};

export function readProfileQuery(params: URLSearchParams): ProfileQuery {
  return {
    handle: readRequired(params, 'handle'),
    theme: readTheme(params),
    lang: readLang(params),
    width: readInt(params, 'width', 200, 1200),
    colors: readColors(params),
  };
}

// ---------------------------------------------------------------------------
// /api/cards?handle=...&sort=...&max=...
// ---------------------------------------------------------------------------

export type CardsQuery = {
  handle: string;
  layout: CardLayout | undefined;
  preset: PresetName | undefined;
  sort: SortKey | undefined;
  max: number | undefined;
  includeTags: string[] | undefined;
  excludeTags: string[] | undefined;
  minDurationSeconds: number | undefined;
  maxDurationSeconds: number | undefined;
  minPlays: number | undefined;
  minLikes: number | undefined;
  pinnedFirst: boolean | undefined;
  featured: string[] | undefined;
  allowExplicit: boolean | undefined;
  showProfileCard: boolean | undefined;
  showProgress: boolean | undefined;
  showLogo: boolean | undefined;
  showLinkIcon: boolean | undefined;
  theme: ThemeMode | undefined;
  lang: Lang | undefined;
  width: number | undefined;
  colors: ColorOverrides;
};

export function readCardsQuery(params: URLSearchParams): CardsQuery {
  return {
    handle: readRequired(params, 'handle'),
    layout: readLayout(params),
    preset: readPreset(params),
    sort: readSort(params),
    max: readInt(params, 'max', 1, 20),
    includeTags: readCsv(params, 'include_tags'),
    excludeTags: readCsv(params, 'exclude_tags'),
    minDurationSeconds: readInt(params, 'min_duration', 0, 3600),
    maxDurationSeconds: readInt(params, 'max_duration', 0, 3600),
    minPlays: readInt(params, 'min_plays', 0, 1_000_000),
    minLikes: readInt(params, 'min_likes', 0, 1_000_000),
    pinnedFirst: readBool(params, 'pinned_first'),
    featured: readCsv(params, 'featured'),
    allowExplicit: readBool(params, 'allow_explicit'),
    showProfileCard: readBool(params, 'show_profile_card'),
    showProgress: readBool(params, 'show_progress'),
    showLogo: readBool(params, 'show_logo'),
    showLinkIcon: readBool(params, 'show_link_icon'),
    theme: readTheme(params),
    lang: readLang(params),
    width: readInt(params, 'width', 200, 1200),
    colors: readColors(params),
  };
}
