import type { SunoSong } from '@suno-cards/parser';
import { renderEqualizer } from './equalizer.js';
import { escapeAttr, escapeXml } from './escape.js';
import { formatCount, formatDuration } from './format.js';
import { type Lang, formatRelativeTime, t } from './i18n/index.js';
import { renderLinkIcon } from './linkIcon.js';
import { renderModelBadgeHtml } from './modelBadge.js';
import { renderNewBadge } from './newBadge.js';
import { renderProgressBar } from './progressBar.js';
import { renderSunoLogo } from './sunoLogo.js';
import { renderTagChipsHtml } from './tagChips.js';
import type { PresetName } from './themes.js';

export type CardLayout = 'classic' | 'player';

export type SongCardOptions = {
  /** Data URI (data:image/jpeg;base64,...) for the cover. Passed in by the caller. */
  coverDataUri?: string | null;
  width?: number;
  height?: number;
  lang?: Lang;
  /** Card layout. `classic` = info-dense, `player` = Suno-style player. Default `classic`. */
  layout?: CardLayout;
  /** Color preset. Default `default`. */
  preset?: PresetName;
  showPlays?: boolean;
  showLikes?: boolean;
  showDuration?: boolean;
  showAuthor?: boolean;
  showEqualizer?: boolean;
  showModelBadge?: boolean;
  showNewBadge?: boolean;
  showTags?: boolean;
  /** Show progress bar with play button and time labels. Default depends on layout. */
  showProgress?: boolean;
  /** Show SUNO logo in bottom-right. Default depends on layout. */
  showLogo?: boolean;
  /** Show link icon in top-right. Default depends on layout. */
  showLinkIcon?: boolean;
  /** Max tag chips rendered. Default 4. */
  maxTags?: number;
  /**
   * When embedding into a larger SVG via `cardStack`, the caller supplies an
   * x/y offset so the primitive translates itself into place. Defaults to (0, 0).
   */
  x?: number;
  y?: number;
};

export const SONG_CARD_DEFAULT_WIDTH = 480;
export const SONG_CARD_DEFAULT_HEIGHT = 140;
const COVER_SIZE = 120;
const COVER_PADDING = 10;

// Player layout constants
export const PLAYER_CARD_DEFAULT_WIDTH = 640;
export const PLAYER_CARD_DEFAULT_HEIGHT = 160;
const PLAYER_COVER_SIZE = 130;
const PLAYER_COVER_PADDING = 15;
const PLAYER_COVER_RADIUS = 12;

/**
 * Render a single Spotify-flashy song card as a `<g>` group at the given
 * offset. Caller is responsible for wrapping it in a root `<svg>` element
 * that provides the shared <defs>, <style>, and gradient definitions —
 * use `svg.ts::renderRootSvg` or compose multiple via `cardStack.ts`.
 *
 * Visual anatomy (480×140):
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ ┌────────┐  Song Title (2 lines max)          │
 *   │ │        │  ◼ chip ◼ chip ◼ chip               │
 *   │ │ cover  │  ▶ 12.3k  ♥ 456  3d ago  [v4.5-all]│
 *   │ │ 120px  │                                    │
 *   │ │ [bars] │                                    │
 *   │ │  2:14  │                                    │
 *   │ └────────┘                                    │
 *   └──────────────────────────────────────────────┘
 */
export function renderSongCard(song: SunoSong, opts: SongCardOptions = {}): string {
  const layout = opts.layout ?? 'classic';
  if (layout === 'player') return renderPlayerCard(song, opts);

  const width = opts.width ?? SONG_CARD_DEFAULT_WIDTH;
  const height = opts.height ?? SONG_CARD_DEFAULT_HEIGHT;
  const lang = opts.lang ?? 'en';
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;

  const showPlays = opts.showPlays ?? true;
  const showLikes = opts.showLikes ?? true;
  const showDuration = opts.showDuration ?? true;
  const showAuthor = opts.showAuthor ?? true;
  const showEqualizer = opts.showEqualizer ?? true;
  const showModelBadge = opts.showModelBadge ?? true;
  const showNewBadge = opts.showNewBadge ?? true;
  const showTags = opts.showTags ?? true;

  // ---------- Cover panel ---------------------------------------------------
  const coverX = COVER_PADDING;
  const coverY = (height - COVER_SIZE) / 2;
  const coverClipId = `cover-clip-${song.id}`;

  const coverImage = opts.coverDataUri
    ? `<image xlink:href="${escapeAttr(opts.coverDataUri)}" href="${escapeAttr(opts.coverDataUri)}" x="${coverX}" y="${coverY}" width="${COVER_SIZE}" height="${COVER_SIZE}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${coverClipId})" />`
    : // Fallback: a gradient-filled placeholder with a music-note glyph
      `<rect x="${coverX}" y="${coverY}" width="${COVER_SIZE}" height="${COVER_SIZE}" rx="10" fill="url(#cover-placeholder)" />
       <text x="${coverX + COVER_SIZE / 2}" y="${coverY + COVER_SIZE / 2 + 8}" text-anchor="middle" font-size="36" fill="rgba(255,255,255,0.6)">♪</text>`;

  // Duration pill in cover bottom-right
  const durationPill =
    showDuration && song.durationSeconds > 0
      ? (() => {
          const label = formatDuration(song.durationSeconds);
          const pillWidth = label.length * 7 + 10;
          const pillX = coverX + COVER_SIZE - pillWidth - 6;
          const pillY = coverY + COVER_SIZE - 22;
          return `<g class="duration-badge"><rect class="duration-pill" x="${pillX}" y="${pillY}" width="${pillWidth}" height="16" rx="8" /><text class="duration-text" x="${pillX + pillWidth / 2}" y="${pillY + 11}" text-anchor="middle">${escapeXml(label)}</text></g>`;
        })()
      : '';

  // Equalizer bars — top-left corner of cover
  const equalizer = showEqualizer
    ? renderEqualizer({ x: coverX + 8, y: coverY + 8, width: 36, height: 32 })
    : '';

  // NEW badge top-right
  const newBadge =
    showNewBadge && song.isNew ? renderNewBadge(coverX + COVER_SIZE - 44, coverY + 8, lang) : '';

  // ---------- Text panel (foreignObject) -----------------------------------
  const textX = coverX + COVER_SIZE + 14;
  const textY = coverY + 4;
  const textWidth = width - textX - 14;
  const textHeight = COVER_SIZE - 8;

  const title = song.title.trim() || '(untitled)';
  const authorLine =
    showAuthor && song.author.displayName
      ? `<p class="song-by">${escapeXml(`${t(lang, 'by')} ${song.author.displayName}${song.author.handle ? ` · @${song.author.handle}` : ''}`)}</p>`
      : '';

  const chipsHtml = showTags ? renderTagChipsHtml(song.classifiedTags, { max: opts.maxTags }) : '';

  // Each stat uses a unicode emoji prefix + localized label so the meaning
  // of every number is unambiguous ("▶ 7 plays" instead of bare "7").
  const statItems: string[] = [];
  if (showPlays) {
    const label = `▶ ${formatCount(song.playCount)} ${t(lang, 'plays')}`;
    statItems.push(`<span class="stat">${escapeXml(label)}</span>`);
  }
  if (showLikes) {
    const label = `♥ ${formatCount(song.likeCount)} ${t(lang, 'likes')}`;
    statItems.push(`<span class="stat">${escapeXml(label)}</span>`);
  }
  if (song.createdAt) {
    const rel = formatRelativeTime(song.createdAt, lang);
    if (rel) statItems.push(`<span class="stat">${escapeXml(rel)}</span>`);
  }
  const statsRow = statItems.length > 0 ? `<div class="stats-row">${statItems.join('')}</div>` : '';

  const modelBadge = showModelBadge ? renderModelBadgeHtml(song) : '';
  const metaFooter = modelBadge
    ? `<div class="meta-footer" style="display:flex;gap:6px;margin-top:7px;align-items:center">${modelBadge}</div>`
    : '';

  const foreignObject = `<foreignObject x="${textX}" y="${textY}" width="${textWidth}" height="${textHeight}">
    <div xmlns="http://www.w3.org/1999/xhtml" class="text-panel">
      <p class="song-title">${escapeXml(title)}</p>
      ${authorLine}
      ${chipsHtml}
      ${statsRow}
      ${metaFooter}
    </div>
  </foreignObject>`;

  // ---------- Compose -------------------------------------------------------
  return `<g class="song-card" transform="translate(${x}, ${y})">
    <clipPath id="${coverClipId}"><rect x="${coverX}" y="${coverY}" width="${COVER_SIZE}" height="${COVER_SIZE}" rx="10" /></clipPath>
    <rect class="card-bg" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="14" />
    ${coverImage}
    <rect class="cover-overlay" x="${coverX}" y="${coverY}" width="${COVER_SIZE}" height="${COVER_SIZE}" rx="10" />
    ${durationPill}
    ${equalizer}
    ${newBadge}
    ${foreignObject}
  </g>`;
}

// ---------------------------------------------------------------------------
// Player layout — Suno-style music player card
// ---------------------------------------------------------------------------

function renderPlayerCard(song: SunoSong, opts: SongCardOptions): string {
  const width = opts.width ?? PLAYER_CARD_DEFAULT_WIDTH;
  const height = opts.height ?? PLAYER_CARD_DEFAULT_HEIGHT;
  const lang = opts.lang ?? 'en';
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;

  // Player layout defaults: minimal, music-player-like
  const showEqualizer = opts.showEqualizer ?? true;
  const showProgress = opts.showProgress ?? true;
  const showLogo = opts.showLogo ?? true;
  const showLinkIconFlag = opts.showLinkIcon ?? true;
  const showNewBadge = opts.showNewBadge ?? false;
  const showDuration = opts.showDuration ?? false;

  // ---------- Cover panel ---------------------------------------------------
  const coverX = PLAYER_COVER_PADDING;
  const coverY = (height - PLAYER_COVER_SIZE) / 2;
  const coverClipId = `cover-clip-${song.id}`;

  const coverImage = opts.coverDataUri
    ? `<image xlink:href="${escapeAttr(opts.coverDataUri)}" href="${escapeAttr(opts.coverDataUri)}" x="${coverX}" y="${coverY}" width="${PLAYER_COVER_SIZE}" height="${PLAYER_COVER_SIZE}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${coverClipId})" filter="url(#cover-glow)" />`
    : `<rect x="${coverX}" y="${coverY}" width="${PLAYER_COVER_SIZE}" height="${PLAYER_COVER_SIZE}" rx="${PLAYER_COVER_RADIUS}" fill="url(#cover-placeholder)" filter="url(#cover-glow)" />
       <text x="${coverX + PLAYER_COVER_SIZE / 2}" y="${coverY + PLAYER_COVER_SIZE / 2 + 8}" text-anchor="middle" font-size="36" fill="rgba(255,255,255,0.6)">♪</text>`;

  // Duration pill (hidden by default in player, shown if explicitly enabled)
  const durationPill =
    showDuration && song.durationSeconds > 0
      ? (() => {
          const label = formatDuration(song.durationSeconds);
          const pillWidth = label.length * 7 + 10;
          const pillX = coverX + PLAYER_COVER_SIZE - pillWidth - 6;
          const pillY = coverY + PLAYER_COVER_SIZE - 22;
          return `<g class="duration-badge"><rect class="duration-pill" x="${pillX}" y="${pillY}" width="${pillWidth}" height="16" rx="8" /><text class="duration-text" x="${pillX + pillWidth / 2}" y="${pillY + 11}" text-anchor="middle">${escapeXml(label)}</text></g>`;
        })()
      : '';

  // Equalizer bars — top-left corner of cover (kept by default!)
  const equalizer = showEqualizer
    ? renderEqualizer({ x: coverX + 8, y: coverY + 8, width: 36, height: 32 })
    : '';

  // NEW badge
  const newBadge =
    showNewBadge && song.isNew
      ? renderNewBadge(coverX + PLAYER_COVER_SIZE - 44, coverY + 8, lang)
      : '';

  // ---------- Text area (right of cover) ------------------------------------
  const contentX = coverX + PLAYER_COVER_SIZE + 16;
  const contentWidth = width - contentX - 16;

  // Title — single line via foreignObject for CJK support
  const title = song.title.trim() || '(untitled)';
  const titleY = coverY + 4;
  const titleHeight = 26;
  const titleFO = `<foreignObject x="${contentX}" y="${titleY}" width="${contentWidth - (showLinkIconFlag ? 24 : 0)}" height="${titleHeight}">
    <p xmlns="http://www.w3.org/1999/xhtml" class="player-title">${escapeXml(title)}</p>
  </foreignObject>`;

  // Progress bar — centered vertically in the remaining space below title
  const progressY = coverY + PLAYER_COVER_SIZE / 2 + 8;
  const progressBar =
    showProgress && song.durationSeconds > 0
      ? renderProgressBar({
          x: contentX,
          y: progressY,
          width: contentWidth,
          durationSeconds: song.durationSeconds,
        })
      : '';

  // SUNO logo — bottom-right
  const logo = showLogo ? renderSunoLogo(width - 16, height - 16) : '';

  // Link icon — top-right
  const linkIcon = showLinkIconFlag ? renderLinkIcon(width - 30, coverY + 4, 14) : '';

  // ---------- Compose -------------------------------------------------------
  return `<g class="song-card" transform="translate(${x}, ${y})">
    <clipPath id="${coverClipId}"><rect x="${coverX}" y="${coverY}" width="${PLAYER_COVER_SIZE}" height="${PLAYER_COVER_SIZE}" rx="${PLAYER_COVER_RADIUS}" /></clipPath>
    <rect class="card-bg" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="14" />
    ${coverImage}
    <rect class="cover-overlay" x="${coverX}" y="${coverY}" width="${PLAYER_COVER_SIZE}" height="${PLAYER_COVER_SIZE}" rx="${PLAYER_COVER_RADIUS}" />
    ${durationPill}
    ${equalizer}
    ${newBadge}
    ${titleFO}
    ${progressBar}
    ${logo}
    ${linkIcon}
  </g>`;
}
