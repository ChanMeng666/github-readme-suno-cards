import type { SunoProfile, SunoSong } from '@suno-cards/parser';
import type { Lang } from './i18n/index.js';
import { PROFILE_CARD_DEFAULT_HEIGHT, renderProfileCard } from './profileCard.js';
import {
  SONG_CARD_DEFAULT_HEIGHT,
  SONG_CARD_DEFAULT_WIDTH,
  type SongCardOptions,
  renderSongCard,
} from './songCard.js';
import { renderRootSvg } from './svg.js';
import type { ColorOverrides, ThemeMode } from './themes.js';

export type CardStackItem =
  | { kind: 'profile'; profile: SunoProfile; avatarDataUri?: string | null }
  | { kind: 'song'; song: SunoSong; coverDataUri?: string | null };

export type CardStackOptions = {
  width?: number;
  gap?: number;
  theme?: ThemeMode;
  colorOverrides?: ColorOverrides;
  lang?: Lang;
  /** Forwarded to every song card in the stack. */
  songOptions?: Omit<SongCardOptions, 'x' | 'y' | 'coverDataUri' | 'width' | 'height' | 'lang'>;
};

/**
 * Stack a mixed list of cards (profile + songs) vertically into a single SVG.
 * The Action's `/api/cards` route uses this; so does the web service for the
 * multi-card endpoint.
 */
export function renderCardStack(items: CardStackItem[], opts: CardStackOptions = {}): string {
  const width = opts.width ?? SONG_CARD_DEFAULT_WIDTH;
  const gap = opts.gap ?? 10;
  const lang = opts.lang ?? 'en';

  if (items.length === 0) {
    return renderRootSvg('', {
      width,
      height: 40,
      theme: opts.theme,
      colorOverrides: opts.colorOverrides,
    });
  }

  const heights = items.map((item) =>
    item.kind === 'profile' ? PROFILE_CARD_DEFAULT_HEIGHT : SONG_CARD_DEFAULT_HEIGHT,
  );
  const totalHeight = heights.reduce((acc, h) => acc + h, 0) + gap * (items.length - 1);

  const inner: string[] = [];
  let yCursor = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const h = heights[i]!;
    if (item.kind === 'profile') {
      inner.push(
        renderProfileCard(item.profile, {
          width,
          height: PROFILE_CARD_DEFAULT_HEIGHT,
          lang,
          avatarDataUri: item.avatarDataUri ?? null,
          x: 0,
          y: yCursor,
        }),
      );
    } else {
      inner.push(
        renderSongCard(item.song, {
          ...(opts.songOptions ?? {}),
          width,
          height: SONG_CARD_DEFAULT_HEIGHT,
          lang,
          coverDataUri: item.coverDataUri ?? null,
          x: 0,
          y: yCursor,
        }),
      );
    }
    yCursor += h + gap;
  }

  return renderRootSvg(inner.join('\n'), {
    width,
    height: totalHeight,
    theme: opts.theme,
    colorOverrides: opts.colorOverrides,
  });
}

/**
 * Convenience: render a single song card wrapped in a root SVG. Used by the
 * `/api/card` route and the Action's service-mode emit.
 */
export function renderSingleSongSvg(
  song: SunoSong,
  opts: Omit<SongCardOptions, 'x' | 'y'> & {
    theme?: ThemeMode;
    colorOverrides?: ColorOverrides;
  } = {},
): string {
  const width = opts.width ?? SONG_CARD_DEFAULT_WIDTH;
  const height = opts.height ?? SONG_CARD_DEFAULT_HEIGHT;
  const inner = renderSongCard(song, { ...opts, x: 0, y: 0, width, height });
  return renderRootSvg(inner, {
    width,
    height,
    theme: opts.theme,
    colorOverrides: opts.colorOverrides,
  });
}

/** Convenience: render a single profile card wrapped in a root SVG. */
export function renderSingleProfileSvg(
  profile: SunoProfile,
  opts: {
    avatarDataUri?: string | null;
    width?: number;
    height?: number;
    theme?: ThemeMode;
    colorOverrides?: ColorOverrides;
    lang?: Lang;
  } = {},
): string {
  const width = opts.width ?? SONG_CARD_DEFAULT_WIDTH;
  const height = opts.height ?? PROFILE_CARD_DEFAULT_HEIGHT;
  const inner = renderProfileCard(profile, {
    width,
    height,
    lang: opts.lang,
    avatarDataUri: opts.avatarDataUri ?? null,
    x: 0,
    y: 0,
  });
  return renderRootSvg(inner, {
    width,
    height,
    theme: opts.theme,
    colorOverrides: opts.colorOverrides,
  });
}
