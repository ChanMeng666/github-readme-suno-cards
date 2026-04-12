import * as v from 'valibot';
import {
  SunoNotFoundError,
  SunoNotReadyError,
  SunoPrivateError,
  SunoSchemaError,
} from './errors.js';
import { type FetchJsonOptions, fetchJson } from './fetcher.js';
import { mapClipToSong } from './mapping.js';
import { ClipSchema, type SunoSong } from './schema.js';

export const STUDIO_API_BASE = 'https://studio-api-prod.suno.com';

export type FetchClipOptions = FetchJsonOptions & {
  /** Skip the "not ready" / "private" guards and return whatever we got. */
  includeIncomplete?: boolean;
};

/**
 * Fetch a single clip by UUID from `/api/clip/{uuid}`.
 *
 * Success → normalized `SunoSong` (source='clip').
 * 404     → `SunoNotFoundError`
 * 403     → `SunoPrivateError`
 * is_public=false → `SunoPrivateError` (unless `includeIncomplete`)
 * status!=complete → `SunoNotReadyError` (unless `includeIncomplete`)
 * Invalid body → `SunoSchemaError`
 * Network   → `SunoNetworkError` (from fetcher)
 */
export async function fetchClip(uuid: string, opts: FetchClipOptions = {}): Promise<SunoSong> {
  const url = `${STUDIO_API_BASE}/api/clip/${encodeURIComponent(uuid)}`;

  const { status, body } = await fetchJson<unknown>(url, {
    ...opts,
    cacheTags: opts.cacheTags ?? [`suno-clip-${uuid}`],
    revalidateSeconds: opts.revalidateSeconds ?? 3600,
  });

  if (status === 404) throw new SunoNotFoundError(uuid);
  if (status === 403) throw new SunoPrivateError(uuid);
  if (status < 200 || status >= 300) {
    throw new SunoSchemaError(url, { status }, body);
  }

  const result = v.safeParse(ClipSchema, body);
  if (!result.success) {
    throw new SunoSchemaError(url, result.issues, body);
  }
  const clip = result.output;

  if (!opts.includeIncomplete) {
    if (!clip.is_public) throw new SunoPrivateError(uuid);
    if (clip.status !== 'complete') throw new SunoNotReadyError(uuid, clip.status);
  }

  return mapClipToSong(clip, 'clip');
}
