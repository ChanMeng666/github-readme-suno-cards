import { fetchAllClips } from '@suno-cards/parser';
import {
  type CardStackItem,
  PLAYER_CARD_DEFAULT_HEIGHT,
  PLAYER_CARD_DEFAULT_WIDTH,
  PROFILE_CARD_DEFAULT_HEIGHT,
  SONG_CARD_DEFAULT_HEIGHT,
  SONG_CARD_DEFAULT_WIDTH,
  renderCardStack,
} from '@suno-cards/render';
import type { NextRequest } from 'next/server';

import { errorToSvg, svgResponse } from '@/lib/errorSvg';
import { fetchAsDataUri } from '@/lib/image';
import { QueryError, readCardsQuery } from '@/lib/query';

export const runtime = 'edge';
export const revalidate = 600;

/**
 * GET /api/cards?handle=<handle>&sort=<created_at|play_count|upvote_count|name>&max=<N>
 *
 * Auto-discovery mode: fetches the user's full public library, filters,
 * ranks, and emits a vertically stacked SVG with an optional profile
 * summary card on top.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);

  let q: ReturnType<typeof readCardsQuery>;
  try {
    q = readCardsQuery(url.searchParams);
  } catch (err) {
    if (err instanceof QueryError) {
      return svgResponse(errorToSvg(err, { lang: 'en' }), 60);
    }
    throw err;
  }

  const lang = q.lang ?? 'en';
  const theme = q.theme ?? 'auto';
  const max = q.max ?? 6;
  const showProfileCard = q.showProfileCard ?? true;

  try {
    const result = await fetchAllClips(q.handle, {
      sortBy: q.sort ?? 'created_at',
      max,
      includeTags: q.includeTags,
      excludeTags: q.excludeTags,
      minDurationSeconds: q.minDurationSeconds,
      maxDurationSeconds: q.maxDurationSeconds,
      minPlays: q.minPlays,
      minLikes: q.minLikes,
      pinnedFirst: q.pinnedFirst,
      allowExplicit: q.allowExplicit,
      featured: q.featured,
    });

    const [avatarDataUri, ...coverDataUris] = await Promise.all([
      showProfileCard ? fetchAsDataUri(result.profile.avatarUrl) : Promise.resolve(null),
      ...result.clips.map((c) => fetchAsDataUri(c.coverUrl)),
    ]);

    const items: CardStackItem[] = [];
    if (showProfileCard) {
      items.push({ kind: 'profile', profile: result.profile, avatarDataUri });
    }
    result.clips.forEach((song, i) => {
      items.push({ kind: 'song', song, coverDataUri: coverDataUris[i] ?? null });
    });

    const svg = renderCardStack(items, {
      theme,
      lang,
      width: q.width,
      colorOverrides: q.colors,
      preset: q.preset,
      songOptions: {
        layout: q.layout,
        preset: q.preset,
        showProgress: q.showProgress,
        showLogo: q.showLogo,
        showLinkIcon: q.showLinkIcon,
      },
    });
    return svgResponse(svg, 600);
  } catch (err) {
    const isPlayer = (q.layout ?? 'classic') === 'player';
    const songH = isPlayer ? PLAYER_CARD_DEFAULT_HEIGHT : SONG_CARD_DEFAULT_HEIGHT;
    const approxHeight = (showProfileCard ? PROFILE_CARD_DEFAULT_HEIGHT + 10 : 0) + songH;
    const fallbackWidth =
      q.width ?? (isPlayer ? PLAYER_CARD_DEFAULT_WIDTH : SONG_CARD_DEFAULT_WIDTH);
    return svgResponse(
      errorToSvg(err, { lang, theme, width: fallbackWidth, height: approxHeight }),
      300,
    );
  }
}
