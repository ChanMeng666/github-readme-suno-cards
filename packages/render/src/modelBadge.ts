import type { BadgeTheme, SunoSong } from '@suno-cards/parser';
import { escapeXml } from './escape.js';

/** `linear-gradient(90deg, …)` for a badge side; `null` when Suno sent no stops. */
function gradientCss(side: BadgeTheme): string | null {
  if (!side.gradient || side.gradient.length === 0) return null;
  // A one-stop gradient is not valid everywhere; repeat the stop instead.
  const stops = side.gradient.length === 1 ? [side.gradient[0], side.gradient[0]] : side.gradient;
  return `linear-gradient(90deg, ${stops.join(', ')})`;
}

/**
 * Render the Suno model version badge ("v4.5-all", "V6", …) as an HTML pill,
 * in the colours Suno ships for it.
 *
 * Suno stopped sending badge background and border colours around 2026-09-10,
 * and started sending a text gradient for its newest model. Missing colours
 * become `transparent`; a gradient becomes `--badge-grad-*` plus the
 * `has-grad` class, which `cardCss.ts` draws with `background-clip: text` and
 * falls back to the plain text colour where that is unsupported. Falls back to
 * theme-variable colours when a clip carries no badge tokens at all.
 */
export function renderModelBadgeHtml(song: SunoSong): string {
  // `chirp-chirp` with no version is how Suno marks a clip no model generated
  // (uploads, studio exports) — there is no model to badge.
  if (!song.modelVersion && song.modelName === 'chirp-chirp') return '';
  const version = song.modelVersion || song.modelName || '';
  if (!version) return '';

  const safe = escapeXml(version);
  const theme = song.modelBadgeTheme;

  if (!theme) {
    return `<span class="badge-model badge-model-fallback">${safe}</span>`;
  }

  // Both schemes go out as CSS variables; `cardCss.ts` picks one per the
  // card's theme class (pinned) or `prefers-color-scheme` (auto).
  const vars: string[] = [];
  let hasGradient = false;
  for (const [mode, side] of [
    ['light', theme.light],
    ['dark', theme.dark],
  ] as const) {
    vars.push(
      `--badge-text-${mode}:${side.text}`,
      `--badge-bg-${mode}:${side.bg ?? 'transparent'}`,
      `--badge-border-${mode}:${side.border ?? 'transparent'}`,
    );
    const grad = gradientCss(side);
    if (grad) hasGradient = true;
    // A side without stops still needs a value once the class is on, so it
    // gets a flat "gradient" of its own text colour.
    vars.push(
      `--badge-grad-${mode}:${grad ?? `linear-gradient(90deg, ${side.text}, ${side.text})`}`,
    );
  }

  const cls = hasGradient
    ? 'badge-model badge-model-suno has-grad'
    : 'badge-model badge-model-suno';
  return `<span class="${cls}" style="${escapeXml(vars.join(';'))}">${safe}</span>`;
}

/**
 * Render Suno's secondary badges ("Cover", "Upload", "Full Song") as small
 * neutral chips. Suno no longer publishes colours for these, so they use the
 * card's own chip tokens. Returns `''` when the clip has none.
 */
export function renderSecondaryBadgesHtml(song: SunoSong): string {
  const badges = song.secondaryBadges;
  if (!badges || badges.length === 0) return '';
  return badges
    .map(
      (b) =>
        `<span class="badge-secondary" data-key="${escapeXml(b.key)}">${escapeXml(b.label)}</span>`,
    )
    .join('');
}
