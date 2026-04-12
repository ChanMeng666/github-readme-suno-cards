import { fetchProfile } from '@suno-cards/parser';
import { renderSingleProfileSvg } from '@suno-cards/render';
import type { NextRequest } from 'next/server';

import { errorToSvg, svgResponse } from '@/lib/errorSvg';
import { fetchAsDataUri } from '@/lib/image';
import { QueryError, readProfileQuery } from '@/lib/query';

export const runtime = 'edge';
export const revalidate = 600;

/**
 * GET /api/profile?handle=<handle>
 *
 * Renders a profile summary card: avatar + handle + aggregate stats
 * (songs / plays / likes / followers).
 */
export async function GET(req: NextRequest): Promise<Response> {
  const url = new URL(req.url);

  let q: ReturnType<typeof readProfileQuery>;
  try {
    q = readProfileQuery(url.searchParams);
  } catch (err) {
    if (err instanceof QueryError) {
      return svgResponse(errorToSvg(err, { lang: 'en' }), 60);
    }
    throw err;
  }

  const lang = q.lang ?? 'en';
  const theme = q.theme ?? 'auto';

  try {
    const profile = await fetchProfile(q.handle);
    const avatarDataUri = await fetchAsDataUri(profile.avatarUrl);

    const svg = renderSingleProfileSvg(profile, {
      avatarDataUri,
      theme,
      lang,
      width: q.width,
      colorOverrides: q.colors,
    });
    return svgResponse(svg, 600);
  } catch (err) {
    return svgResponse(errorToSvg(err, { lang, theme, width: q.width }), 300);
  }
}
