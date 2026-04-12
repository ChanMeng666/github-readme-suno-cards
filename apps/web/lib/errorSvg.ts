import {
  SunoError,
  SunoHandleNotFoundError,
  SunoInvalidInputError,
  SunoNotFoundError,
  SunoNotReadyError,
  SunoPrivateError,
} from '@suno-cards/parser';
import {
  type ErrorKind,
  type Lang,
  type ThemeMode,
  renderErrorCard,
  renderRootSvg,
} from '@suno-cards/render';

/**
 * Map any parser error (or unknown error) to a themed error SVG.
 * Always returns a valid SVG so GitHub's image proxy caches a useful
 * placeholder — we never 500 on client-visible endpoints.
 */
export function errorToSvg(
  err: unknown,
  opts: { lang?: Lang; theme?: ThemeMode; width?: number; height?: number } = {},
): string {
  const width = opts.width ?? 480;
  const height = opts.height ?? 140;
  const { kind, detail } = classifyError(err);
  const inner = renderErrorCard(kind, { lang: opts.lang, width, height, detail });
  return renderRootSvg(inner, { width, height, theme: opts.theme ?? 'auto' });
}

export function classifyError(err: unknown): { kind: ErrorKind; detail: string } {
  if (err instanceof SunoNotFoundError) {
    return { kind: 'not_found', detail: err.uuid };
  }
  if (err instanceof SunoHandleNotFoundError) {
    return { kind: 'not_found', detail: `@${err.handle}` };
  }
  if (err instanceof SunoPrivateError) {
    return { kind: 'private', detail: err.uuid };
  }
  if (err instanceof SunoNotReadyError) {
    return { kind: 'not_ready', detail: err.status };
  }
  if (err instanceof SunoInvalidInputError) {
    return { kind: 'not_found', detail: err.input };
  }
  if (err instanceof SunoError) {
    return { kind: 'error', detail: err.message };
  }
  if (err instanceof Error) {
    return { kind: 'error', detail: err.message };
  }
  return { kind: 'error', detail: String(err) };
}

/**
 * Build the standard HTTP Response for a successful SVG card payload.
 * Emits cache-friendly headers so GitHub's image proxy (Camo) and Vercel's
 * edge cache both respect the revalidation window.
 */
export function svgResponse(svg: string, maxAgeSeconds = 3600): Response {
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 24}`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
