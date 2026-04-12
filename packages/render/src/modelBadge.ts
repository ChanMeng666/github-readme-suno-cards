import type { SunoSong } from '@suno-cards/parser';
import { escapeXml } from './escape.js';

/**
 * Render the Suno model version badge ("v4.5-all", "v5", …) as an HTML pill.
 *
 * If the clip carries `model_badges.songrow.{light,dark}` colors, we apply
 * them exactly — the result is pixel-identical to how Suno themselves render
 * this badge inside their web UI. Falls back to theme-variable colors when
 * Suno omits the tokens (older models).
 */
export function renderModelBadgeHtml(song: SunoSong): string {
  const version = song.modelVersion || song.modelName || '';
  if (!version) return '';

  const safe = escapeXml(version);
  const theme = song.modelBadgeTheme;

  if (!theme) {
    return `<span class="badge-model badge-model-fallback">${safe}</span>`;
  }

  // Inline style so the badge is ALWAYS pixel-identical to Suno's own UI,
  // independent of the card theme variables. We emit both light and dark
  // variants in CSS var form for @media prefers-color-scheme switching.
  const style = [
    `--badge-text-light:${theme.light.text}`,
    `--badge-bg-light:${theme.light.bg}`,
    `--badge-border-light:${theme.light.border}`,
    `--badge-text-dark:${theme.dark.text}`,
    `--badge-bg-dark:${theme.dark.bg}`,
    `--badge-border-dark:${theme.dark.border}`,
  ].join(';');

  return `<span class="badge-model badge-model-suno" style="${style}">${safe}</span>`;
}
