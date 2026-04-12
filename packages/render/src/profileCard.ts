import type { SunoProfile } from '@suno-cards/parser';
import { escapeAttr, escapeXml } from './escape.js';
import { formatCount } from './format.js';
import { type Lang, t } from './i18n/index.js';

export type ProfileCardOptions = {
  avatarDataUri?: string | null;
  width?: number;
  height?: number;
  lang?: Lang;
  showPlays?: boolean;
  showLikes?: boolean;
  showFollowers?: boolean;
  showSongCount?: boolean;
  x?: number;
  y?: number;
};

export const PROFILE_CARD_DEFAULT_WIDTH = 480;
export const PROFILE_CARD_DEFAULT_HEIGHT = 90;
const AVATAR_SIZE = 60;
const PADDING = 15;

/**
 * Horizontal profile summary card: avatar on the left, handle + display name,
 * then a row of big numerical stats (songs · plays · likes · followers).
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ ⬤  @handle                                   │
 *   │    Display Name                               │
 *   │    ▸ 26 songs   ▸ 736 plays   ▸ 55 likes …   │
 *   └──────────────────────────────────────────────┘
 */
export function renderProfileCard(profile: SunoProfile, opts: ProfileCardOptions = {}): string {
  const width = opts.width ?? PROFILE_CARD_DEFAULT_WIDTH;
  const height = opts.height ?? PROFILE_CARD_DEFAULT_HEIGHT;
  const lang = opts.lang ?? 'en';
  const x = opts.x ?? 0;
  const y = opts.y ?? 0;

  const showPlays = opts.showPlays ?? true;
  const showLikes = opts.showLikes ?? true;
  const showFollowers = opts.showFollowers ?? true;
  const showSongCount = opts.showSongCount ?? true;

  const avatarX = PADDING;
  const avatarY = (height - AVATAR_SIZE) / 2;
  const avatarClipId = `avatar-clip-${profile.userId || profile.handle}`;

  const avatarImage = opts.avatarDataUri
    ? `<image xlink:href="${escapeAttr(opts.avatarDataUri)}" href="${escapeAttr(opts.avatarDataUri)}" x="${avatarX}" y="${avatarY}" width="${AVATAR_SIZE}" height="${AVATAR_SIZE}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${avatarClipId})" />`
    : `<circle cx="${avatarX + AVATAR_SIZE / 2}" cy="${avatarY + AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2}" fill="url(#cover-placeholder)" />`;

  const textX = avatarX + AVATAR_SIZE + 14;
  const textY = PADDING - 2;
  const textWidth = width - textX - PADDING;
  const textHeight = height - PADDING * 2 + 4;

  const statBlocks: string[] = [];
  const pushStat = (n: number, label: string) => {
    statBlocks.push(
      `<div class="stat" style="display:inline-flex;align-items:baseline"><span class="profile-stat-num">${escapeXml(formatCount(n))}</span><span class="profile-stat-label">${escapeXml(label)}</span></div>`,
    );
  };
  if (showSongCount) pushStat(profile.totalClips, t(lang, 'songs'));
  if (showPlays) pushStat(profile.stats.totalPlays, t(lang, 'plays'));
  if (showLikes) pushStat(profile.stats.totalLikes, t(lang, 'likes'));
  if (showFollowers) pushStat(profile.stats.followers, t(lang, 'followers'));

  const display = profile.displayName || profile.handle;
  const handleLine = `@${profile.handle}`;

  const foreignObject = `<foreignObject x="${textX}" y="${textY}" width="${textWidth}" height="${textHeight}">
    <div xmlns="http://www.w3.org/1999/xhtml" class="profile-text">
      <p class="profile-handle">${escapeXml(handleLine)}</p>
      ${display !== profile.handle ? `<p class="profile-name">${escapeXml(display)}</p>` : ''}
      <div class="profile-stats">${statBlocks.join('')}</div>
    </div>
  </foreignObject>`;

  return `<g class="profile-card" transform="translate(${x}, ${y})">
    <clipPath id="${avatarClipId}"><circle cx="${avatarX + AVATAR_SIZE / 2}" cy="${avatarY + AVATAR_SIZE / 2}" r="${AVATAR_SIZE / 2}" /></clipPath>
    <rect class="card-bg" x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="14" />
    ${avatarImage}
    ${foreignObject}
  </g>`;
}
