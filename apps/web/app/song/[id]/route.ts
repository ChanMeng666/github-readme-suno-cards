import { GET as cardRouteGet } from '@/app/api/card/route';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
export const revalidate = 3600;

/**
 * Pretty URL alias: /song/{uuid}  →  /api/card?id={uuid}
 *
 * The canonical embed URL is `/api/card?id=...` but `/song/{id}` is easier
 * to type and matches Suno's own URL shape. This handler simply rewrites
 * the URL and delegates to the card route.
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  url.pathname = '/api/card';
  url.searchParams.set('id', id);
  const delegateReq = new Request(url.toString(), req) as NextRequest;
  return cardRouteGet(delegateReq);
}
