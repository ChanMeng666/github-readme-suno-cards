import { escapeXml } from './escape.js';
import { type Lang, t } from './i18n/index.js';

/**
 * Render the "NEW" ribbon as a pure-SVG fragment positioned absolutely at
 * `(x, y)`. Pulses via the `new-badge` class (see animations.ts).
 */
export function renderNewBadge(x: number, y: number, lang: Lang): string {
  const label = escapeXml(t(lang, 'new_badge'));
  return `<g class="new-badge" transform="translate(${x}, ${y})" aria-hidden="true">
    <rect x="0" y="0" width="38" height="18" rx="9" fill="#ef4444" />
    <text x="19" y="13" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#ffffff" letter-spacing="0.5">${label}</text>
  </g>`;
}
