import { fetchSong } from '@suno-cards/parser';
import { renderSingleSongSvg } from '@suno-cards/render';
import type { NextRequest } from 'next/server';

import { errorToSvg, svgResponse } from '@/lib/errorSvg';
import { fetchAsDataUri } from '@/lib/image';
import { QueryError, readCardQuery } from '@/lib/query';

export const runtime = 'edge';
export const revalidate = 3600;

/**
 * GET /api/card?id=<uuid|short|url>
 *
 * Renders a single Spotify-flashy SVG song card for the requested Suno clip.
 * Accepts any input the parser's `fetchSong` accepts — bare UUID, `/song/<uuid>`,
 * `/embed/<uuid>`, `/s/<shortcode>`, or a bare short code.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);

  let q: ReturnType<typeof readCardQuery>;
  try {
    q = readCardQuery(url.searchParams);
  } catch (err) {
    if (err instanceof QueryError) {
      return svgResponse(errorToSvg(err, { lang: 'en' }), 60);
    }
    throw err;
  }

  const lang = q.lang ?? 'en';
  const theme = q.theme ?? 'auto';

  try {
    const song = await fetchSong(q.id);
    const coverDataUri = await fetchAsDataUri(song.coverUrl);

    const svg = renderSingleSongSvg(song, {
      coverDataUri,
      theme,
      lang,
      width: q.width,
      colorOverrides: q.colors,
      showPlays: q.showPlays,
      showLikes: q.showLikes,
      showDuration: q.showDuration,
      showAuthor: q.showAuthor,
      showEqualizer: q.showEqualizer,
      showModelBadge: q.showModelBadge,
      showNewBadge: q.showNewBadge,
      showTags: q.showTags,
      maxTags: q.maxTags,
    });
    return svgResponse(svg);
  } catch (err) {
    return svgResponse(errorToSvg(err, { lang, theme, width: q.width }), 300);
  }
}
