import type { SunoProfile, SunoSong } from '@suno-cards/parser';

/**
 * Emit the README block for `service` render mode.
 *
 * Each card is a hyperlinked markdown image pointing at the hosted Vercel
 * service, so the card auto-refreshes whenever the README is viewed on
 * GitHub (play counts, NEW badges, etc. update live).
 *
 * If theme is 'auto' we emit a <picture>/<source> HTML block that switches
 * between dark and light variants based on GitHub's user theme — borrowed
 * from `youtube-cards`.
 */

export type ServiceTemplateOptions = {
  baseUrl: string;
  theme: 'auto' | 'dark' | 'light';
  outputType: 'markdown' | 'html';
  lang?: string;
  width?: number;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
};

/** URL-encode a single query parameter value. */
const enc = (s: string): string => encodeURIComponent(s);

function buildCardUrl(
  base: string,
  songId: string,
  theme: 'auto' | 'dark' | 'light',
  opts: ServiceTemplateOptions,
): string {
  const params: string[] = [`id=${enc(songId)}`, `theme=${theme}`];
  if (opts.lang) params.push(`lang=${enc(opts.lang)}`);
  if (opts.width != null) params.push(`width=${opts.width}`);
  if (opts.bgColor) params.push(`bg_color=${enc(opts.bgColor.replace(/^#/, ''))}`);
  if (opts.textColor) params.push(`text_color=${enc(opts.textColor.replace(/^#/, ''))}`);
  if (opts.accentColor) params.push(`accent_color=${enc(opts.accentColor.replace(/^#/, ''))}`);
  return `${base.replace(/\/$/, '')}/api/card?${params.join('&')}`;
}

function buildProfileUrl(
  base: string,
  handle: string,
  theme: 'auto' | 'dark' | 'light',
  opts: ServiceTemplateOptions,
): string {
  const params: string[] = [`handle=${enc(handle)}`, `theme=${theme}`];
  if (opts.lang) params.push(`lang=${enc(opts.lang)}`);
  if (opts.width != null) params.push(`width=${opts.width}`);
  return `${base.replace(/\/$/, '')}/api/profile?${params.join('&')}`;
}

/** Escape a markdown/HTML-unsafe character run in a title. */
function escapeMd(s: string): string {
  // Strip [] to avoid breaking markdown image link syntax.
  return s.replace(/[[\]]/g, '');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render a single song line in service mode.
 *   markdown: [![Title](url?theme=X)](https://suno.com/song/uuid)
 *   html:     <picture>...dark/light sources...<img ... /></picture> wrapped in <a>
 */
export function renderServiceSongLine(song: SunoSong, opts: ServiceTemplateOptions): string {
  const title = song.title || '(untitled)';
  const link = song.shareUrl;

  if (opts.outputType === 'markdown') {
    if (opts.theme !== 'auto') {
      const url = buildCardUrl(opts.baseUrl, song.id, opts.theme, opts);
      return `[![${escapeMd(title)}](${url})](${link})`;
    }
    // markdown doesn't have <picture>, so in markdown+auto we just emit the
    // auto variant — the SVG itself handles prefers-color-scheme via @media
    const url = buildCardUrl(opts.baseUrl, song.id, 'auto', opts);
    return `[![${escapeMd(title)}](${url})](${link})`;
  }

  // HTML output with <picture> theme split
  const darkUrl = buildCardUrl(opts.baseUrl, song.id, 'dark', opts);
  const lightUrl = buildCardUrl(opts.baseUrl, song.id, 'light', opts);
  return `<a href="${link}"><picture><source media="(prefers-color-scheme: dark)" srcset="${darkUrl}" /><img alt="${escapeHtml(
    title,
  )}" src="${lightUrl}" /></picture></a>`;
}

export function renderServiceProfileLine(
  profile: SunoProfile,
  opts: ServiceTemplateOptions,
): string {
  const link = profile.shareUrl;
  const alt = profile.displayName || profile.handle;

  if (opts.outputType === 'markdown') {
    const url = buildProfileUrl(opts.baseUrl, profile.handle, opts.theme, opts);
    return `[![${escapeMd(alt)}](${url})](${link})`;
  }
  const darkUrl = buildProfileUrl(opts.baseUrl, profile.handle, 'dark', opts);
  const lightUrl = buildProfileUrl(opts.baseUrl, profile.handle, 'light', opts);
  return `<a href="${link}"><picture><source media="(prefers-color-scheme: dark)" srcset="${darkUrl}" /><img alt="${escapeHtml(
    alt,
  )}" src="${lightUrl}" /></picture></a>`;
}

/**
 * Compose a full service-mode block: optional profile line, then one line
 * per song, joined by blank lines so markdown renders each on its own line.
 */
export function renderServiceBlock(
  profile: SunoProfile | null,
  songs: SunoSong[],
  opts: ServiceTemplateOptions,
): string {
  const lines: string[] = [];
  if (profile) lines.push(renderServiceProfileLine(profile, opts));
  for (const song of songs) lines.push(renderServiceSongLine(song, opts));
  return lines.join('\n\n');
}
