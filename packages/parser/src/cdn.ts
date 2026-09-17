/**
 * Suno cover-image CDN helpers.
 *
 * Covers on `cdn2.suno.ai` accept a `?width=N` query parameter, but **only for a
 * strict whitelist** of values. Any other number returns 403, so a caller must
 * snap up to an allowed size rather than passing whatever its layout happens to
 * need. That is the whole reason this helper exists: the obvious `?width=240`
 * is not a smaller image, it is a broken one.
 *
 * Not only `image_<uuid>.jpeg`. Custom and uploaded covers live at other paths
 * on the same host — `<uuid>.jpeg`, `<uuid>_<hash>.jpeg`,
 * `video_upload_<uuid>_…_image.jpeg` — and measured 2026-09-17 every one of the
 * 21 such covers on two profile pages and the Staff Picks shelf honoured the
 * same whitelist (256 → 200, 240 → 403). They are also where the heavy
 * originals are: up to 3.5 MB, against ~20–50 KB at `?width=256`. Before this
 * was widened, a card for such a clip inlined the full original, and one
 * (`9a1aaed2-…`, a 338 KB cover) timed out on Vercel Edge with a 504.
 */
const ALLOWED_WIDTHS = [100, 256, 360, 720] as const;

const SUNO_IMAGE_HOST_RE = /^cdn2\.suno\.ai$/i;
/** Any image path on the cover host that carries a clip/asset UUID. */
const SUNO_IMAGE_PATH_RE =
  /^\/[\w.-]*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[\w.-]*\.(?:jpeg|jpg|png|webp)$/i;

/** The only `?width=` values Suno's cover CDN accepts. Anything else is a 403. */
export const SUNO_CDN_ALLOWED_WIDTHS = ALLOWED_WIDTHS;

/**
 * Rewrite a Suno cover-image URL to request a specific render size.
 *
 * Snaps `targetWidth` **up** to the nearest allowed value. Returns the URL
 * unchanged when:
 *   - `targetWidth` is >= 720, non-finite, or <= 0 (just take the original),
 *   - the URL is not parseable,
 *   - the host or path is not Suno's cover CDN (e.g. an oEmbed thumbnail on
 *     someone else's host).
 *
 * Safe to call defensively on any URL — a non-Suno URL passes straight through.
 */
export function resizeSunoCover(url: string | null | undefined, targetWidth: number): string {
  if (!url) return '';
  if (targetWidth >= 720 || !Number.isFinite(targetWidth) || targetWidth <= 0) return url;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (!SUNO_IMAGE_HOST_RE.test(parsed.hostname)) return url;
  if (!SUNO_IMAGE_PATH_RE.test(parsed.pathname)) return url;

  const target = Math.ceil(targetWidth);
  const chosen = ALLOWED_WIDTHS.find((w) => w >= target);
  if (chosen == null) return url;

  parsed.searchParams.set('width', String(chosen));
  return parsed.toString();
}
