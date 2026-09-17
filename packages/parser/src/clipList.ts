import * as v from 'valibot';
import { SunoSchemaError, formatIssuePath } from './errors.js';
import { type ClipResponse, ClipSchema } from './schema.js';

/** How many skipped-clip issue paths a result carries. Enough for a log line. */
export const MAX_SKIPPED_ISSUES = 5;

export type ClipListValidation<T> = {
  /** Items whose clip passed {@link ClipSchema}, in their original order. */
  kept: Array<{ item: T; clip: ClipResponse }>;
  skippedClips: number;
  /** `clips.3.metadata.model_badges.songrow.light.background_color`, … */
  skippedIssues: string[];
};

/**
 * Validate each clip of an already-validated envelope on its own.
 *
 * Suno changes the clip shape without notice, and one schema covers every
 * endpoint. Validating a page as a unit meant a single clip in a new shape
 * turned the whole profile into an error card — which is exactly what happened
 * when badge colours were removed in September 2026. Here a failing clip is
 * dropped and counted instead.
 *
 * Throws {@link SunoSchemaError} only when there was at least one clip and
 * **every** clip failed: at that point the shape has moved for everyone, and
 * rendering an empty card would hide it.
 *
 * @param pathOf the envelope path of item `i`'s clip, e.g. `['clips', i]`.
 */
export function validateClipList<T>(
  endpoint: string,
  body: unknown,
  items: readonly T[],
  clipOf: (item: T) => unknown,
  pathOf: (index: number) => Array<string | number>,
): ClipListValidation<T> {
  const kept: ClipListValidation<T>['kept'] = [];
  const skippedIssues: string[] = [];
  let skippedClips = 0;
  let firstIssues: unknown[] | null = null;

  items.forEach((item, index) => {
    const result = v.safeParse(ClipSchema, clipOf(item));
    if (result.success) {
      kept.push({ item, clip: result.output });
      return;
    }
    skippedClips++;
    const prefix = pathOf(index).map((key) => ({ key }));
    const issues = result.issues.map((issue) => ({
      ...issue,
      path: [...prefix, ...(issue.path ?? [])],
    }));
    firstIssues ??= issues;
    if (skippedIssues.length < MAX_SKIPPED_ISSUES) {
      skippedIssues.push(formatIssuePath(issues[0]));
    }
  });

  if (items.length > 0 && kept.length === 0) {
    throw new SunoSchemaError(endpoint, firstIssues, body);
  }

  return { kept, skippedClips, skippedIssues };
}
