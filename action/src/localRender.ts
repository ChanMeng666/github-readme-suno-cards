import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { type SunoProfile, type SunoSong, resizeSunoCover } from '@suno-cards/parser';
import {
  AVATAR_SIZE,
  COVER_SIZE,
  type CardLayout,
  type PresetName,
  type ThemeMode,
  renderSingleProfileSvg,
  renderSingleSongSvg,
} from '@suno-cards/render';

/**
 * Pre-render SVGs to the consumer's repository in `render_mode: local`.
 *
 * For each song we emit TWO SVG files — one dark, one light — and build
 * a <picture> tag that GitHub switches between based on user theme.
 * The profile card is handled the same way.
 *
 * All network I/O (cover/avatar fetching) happens in this file; the pure
 * `packages/render` primitives accept pre-fetched data URIs only.
 */

export type LocalRenderOptions = {
  /** Directory relative to README to write SVGs into, e.g. `.suno-cards`. */
  cardsDir: string;
  /** Absolute path to the README file being edited. */
  readmePath: string;
  /** `auto` → emit dark+light pair wrapped in <picture>. Otherwise single file. */
  theme: ThemeMode;
  lang?: 'en' | 'zh' | 'ja';
  width?: number;
  layout?: CardLayout;
  preset?: PresetName;
  showProgress?: boolean | null;
  showLogo?: boolean | null;
  showLinkIcon?: boolean | null;
  colorOverrides?: {
    bg?: string;
    text?: string;
    subtext?: string;
    accent?: string;
    border?: string;
  };
};

export type LocalRenderResult = {
  /** Markdown/HTML block to insert between markers. */
  block: string;
  /** Absolute paths of every SVG written. */
  writtenFiles: string[];
};

/**
 * Kept in step with the parser's User-Agent. Honest identification, correct
 * URL, and deliberately NOT beginning with `suno` — see the note in
 * packages/parser/src/fetcher.ts. (This previously pointed at the wrong GitHub
 * org, so the `+` URL a curious server operator would follow 404'd.)
 */
const ASSET_USER_AGENT =
  'github-readme-suno-cards/0.2.1 (+https://github.com/ChanMeng666/github-readme-suno-cards)';

/**
 * `renderWidth` is the size the asset will actually be drawn at. Suno's cover
 * CDN only accepts a whitelist of `?width=` values (anything else is a 403),
 * which is what `resizeSunoCover` handles — cards draw covers at ~120px, so
 * fetching the full-size original was wasted bytes on every run.
 */
async function fetchAsDataUri(
  url: string | null | undefined,
  renderWidth?: number,
): Promise<string | null> {
  if (!url) return null;
  const target = renderWidth ? resizeSunoCover(url, renderWidth * 2) : url;
  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': ASSET_USER_AGENT,
        Accept: 'image/*,*/*',
      },
    });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? 'image/jpeg';
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${ct};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Sanitize a UUID for use in a filename — just lowercases and strips non-hex chars. */
function safeFileId(id: string): string {
  return id.toLowerCase().replace(/[^0-9a-f-]/g, '');
}

/** Render one song to (dark + light) SVG files or a single theme-pinned file. */
async function writeSongSvgs(
  song: SunoSong,
  absCardsDir: string,
  opts: LocalRenderOptions,
): Promise<{ dark?: string; light?: string; single?: string }> {
  const coverDataUri = await fetchAsDataUri(song.coverUrl, COVER_SIZE);
  const baseName = `song-${safeFileId(song.id)}`;

  const songOpts = {
    coverDataUri,
    lang: opts.lang,
    width: opts.width,
    colorOverrides: opts.colorOverrides,
    layout: opts.layout,
    preset: opts.preset,
    ...(opts.showProgress != null && { showProgress: opts.showProgress }),
    ...(opts.showLogo != null && { showLogo: opts.showLogo }),
    ...(opts.showLinkIcon != null && { showLinkIcon: opts.showLinkIcon }),
  };

  if (opts.theme === 'auto') {
    const dark = renderSingleSongSvg(song, { ...songOpts, theme: 'dark' });
    const light = renderSingleSongSvg(song, { ...songOpts, theme: 'light' });
    const darkPath = join(absCardsDir, `${baseName}-dark.svg`);
    const lightPath = join(absCardsDir, `${baseName}-light.svg`);
    mkdirSync(dirname(darkPath), { recursive: true });
    writeFileSync(darkPath, dark, 'utf-8');
    writeFileSync(lightPath, light, 'utf-8');
    return { dark: darkPath, light: lightPath };
  }

  const svg = renderSingleSongSvg(song, { ...songOpts, theme: opts.theme });
  const outPath = join(absCardsDir, `${baseName}.svg`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, svg, 'utf-8');
  return { single: outPath };
}

async function writeProfileSvgs(
  profile: SunoProfile,
  absCardsDir: string,
  opts: LocalRenderOptions,
): Promise<{ dark?: string; light?: string; single?: string }> {
  const avatarDataUri = await fetchAsDataUri(profile.avatarUrl, AVATAR_SIZE);
  const baseName = `profile-${profile.handle}`;

  if (opts.theme === 'auto') {
    const dark = renderSingleProfileSvg(profile, {
      avatarDataUri,
      theme: 'dark',
      lang: opts.lang,
      width: opts.width,
      colorOverrides: opts.colorOverrides,
    });
    const light = renderSingleProfileSvg(profile, {
      avatarDataUri,
      theme: 'light',
      lang: opts.lang,
      width: opts.width,
      colorOverrides: opts.colorOverrides,
    });
    const darkPath = join(absCardsDir, `${baseName}-dark.svg`);
    const lightPath = join(absCardsDir, `${baseName}-light.svg`);
    mkdirSync(dirname(darkPath), { recursive: true });
    writeFileSync(darkPath, dark, 'utf-8');
    writeFileSync(lightPath, light, 'utf-8');
    return { dark: darkPath, light: lightPath };
  }

  const svg = renderSingleProfileSvg(profile, {
    avatarDataUri,
    theme: opts.theme,
    lang: opts.lang,
    width: opts.width,
    colorOverrides: opts.colorOverrides,
  });
  const outPath = join(absCardsDir, `${baseName}.svg`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, svg, 'utf-8');
  return { single: outPath };
}

/** Build a <picture> block (or <img> for pinned themes) referring to rel paths. */
function buildPictureBlock(
  paths: { dark?: string; light?: string; single?: string },
  readmePath: string,
  alt: string,
  href: string,
): string {
  const toRel = (abs: string): string => relative(dirname(readmePath), abs).split('\\').join('/');

  if (paths.single) {
    return `<a href="${href}"><img alt="${escapeHtml(alt)}" src="${toRel(paths.single)}" /></a>`;
  }
  if (paths.dark && paths.light) {
    return `<a href="${href}"><picture><source media="(prefers-color-scheme: dark)" srcset="${toRel(
      paths.dark,
    )}" /><img alt="${escapeHtml(alt)}" src="${toRel(paths.light)}" /></picture></a>`;
  }
  return '';
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Top-level entry: render every song (+ optional profile) locally and
 * return the markdown/HTML block plus the list of files written.
 */
export async function renderLocalBlock(
  profile: SunoProfile | null,
  songs: SunoSong[],
  opts: LocalRenderOptions,
): Promise<LocalRenderResult> {
  const absCardsDir = join(dirname(opts.readmePath), opts.cardsDir);
  const writtenFiles: string[] = [];
  const lines: string[] = [];

  if (profile) {
    const paths = await writeProfileSvgs(profile, absCardsDir, opts);
    for (const p of Object.values(paths)) if (p) writtenFiles.push(p);
    lines.push(
      buildPictureBlock(
        paths,
        opts.readmePath,
        profile.displayName || profile.handle,
        profile.shareUrl,
      ),
    );
  }

  for (const song of songs) {
    const paths = await writeSongSvgs(song, absCardsDir, opts);
    for (const p of Object.values(paths)) if (p) writtenFiles.push(p);
    lines.push(
      buildPictureBlock(paths, opts.readmePath, song.title || '(untitled)', song.shareUrl),
    );
  }

  return { block: lines.filter(Boolean).join('\n\n'), writtenFiles };
}
