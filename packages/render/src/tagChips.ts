import type { ClassifiedTags } from '@suno-cards/parser';
import { escapeXml } from './escape.js';

export type TagChipsOptions = {
  /** Max number of chips to render before truncation. */
  max?: number;
  /** Priority order — buckets drained in this sequence. */
  priority?: Array<keyof ClassifiedTags>;
};

/**
 * Drain order when selecting chips for display. Rationale:
 *   1. genre — the strongest identity signal; readers recognize it first
 *   2. era — pairs naturally with genre (e.g. "Synthwave" + "80s")
 *   3. mood — emotional context
 *   4. vocal — voice character distinguishes similar-genre tracks
 *   5. instrument — adds texture
 *   6. production — "live audio" / "lo-fi" are evocative when relevant
 *   7. key — technical, lower visual value
 *   8. other — unclassified creator tags
 *   9. tempo — usually last because "120 BPM" is data, not identity
 */
const DEFAULT_PRIORITY: Array<keyof ClassifiedTags> = [
  'genre',
  'era',
  'mood',
  'vocal',
  'instrument',
  'production',
  'key',
  'other',
  'tempo',
];

/**
 * Flatten the classified tag buckets into a single ordered list, preferring
 * the most "identity-bearing" categories first (genre > mood > vocal > ...).
 */
export function selectChips(tags: ClassifiedTags, opts: TagChipsOptions = {}): string[] {
  const max = opts.max ?? 4;
  const priority = opts.priority ?? DEFAULT_PRIORITY;
  const out: string[] = [];
  for (const bucket of priority) {
    for (const tag of tags[bucket]) {
      if (out.length >= max) return out;
      out.push(tag);
    }
  }
  return out;
}

/**
 * Render a row of tag chips as an HTML snippet for embedding inside a
 * `<foreignObject>`. The wrapper uses flex-wrap, so the caller only needs to
 * provide width.
 */
export function renderTagChipsHtml(tags: ClassifiedTags, opts: TagChipsOptions = {}): string {
  const chips = selectChips(tags, opts);
  if (chips.length === 0) return '';
  const items = chips.map((t) => `<span class="chip">${escapeXml(t)}</span>`).join('');
  return `<div class="chips">${items}</div>`;
}
