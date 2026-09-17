import { escapeXml } from './escape.js';
import { type Lang, t } from './i18n/index.js';

/**
 * Render the "NEW" ribbon as a pure-SVG fragment positioned absolutely at
 * `(x, y)`. Pulses via the `new-badge` class (see animations.ts).
 *
 * The position and the pulse live on SEPARATE groups. A CSS `transform` (the
 * pulse keyframes) replaces an element's SVG `transform` attribute rather than
 * composing with it, so when both sat on one `<g>` the animation discarded the
 * translate: the ribbon jumped to the card's top-left corner mid-pulse and was
 * clipped to "EW" by the card edge.
 */
export function renderNewBadge(x: number, y: number, lang: Lang): string {
  const label = escapeXml(t(lang, 'new_badge'));
  return `<g transform="translate(${x}, ${y})" aria-hidden="true">
    <g class="new-badge">
      <rect x="0" y="0" width="38" height="18" rx="9" fill="#ef4444" />
      <text x="19" y="13" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ffffff" letter-spacing="0.5">${label}</text>
    </g>
  </g>`;
}
