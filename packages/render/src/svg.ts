import { ANIMATION_CSS } from './animations.js';
import { CARD_CSS } from './cardCss.js';
import {
  type ColorOverrides,
  type PresetName,
  type ResolvedTheme,
  type ThemeMode,
  resolvePreset,
  resolveTheme,
  themeCss,
} from './themes.js';

export type SvgRootOptions = {
  width: number;
  height: number;
  theme?: ThemeMode;
  colorOverrides?: ColorOverrides;
  preset?: PresetName;
  title?: string;
};

/**
 * Wraps one or more card primitives in an SVG root containing the shared
 * <defs>, <style>, and gradients. Everything the primitives reference by
 * class or id is defined here — call this exactly once per emitted card.
 */
export function renderRootSvg(innerContent: string, opts: SvgRootOptions): string {
  const baseTheme = resolvePreset(opts.preset ?? 'default');
  const theme = resolveTheme(opts.theme ?? 'auto', opts.colorOverrides ?? {}, baseTheme);
  const css = `${themeCss(theme)}${CARD_CSS}${ANIMATION_CSS}`;
  const titleTag = opts.title ? `<title>${escapeForTitle(opts.title)}</title>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${opts.width}" height="${opts.height}" viewBox="0 0 ${opts.width} ${opts.height}" role="img" class="card-root">
  ${titleTag}
  <defs>
    ${cardGradient(theme)}
    ${coverShadow()}
    ${coverPlaceholder()}
    ${coverGlow()}
  </defs>
  <style>${css}</style>
  ${innerContent}
</svg>`;
}

function escapeForTitle(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function cardGradient(theme: ResolvedTheme): string {
  // A subtle diagonal gradient that shifts through the card bg colors.
  // We use light-mode colors in the gradient defs; the CSS var overrides the
  // fill via `.card-bg { fill: url(#card-gradient) }` → darkness is applied
  // via a separate overlay layer, handled by the theme CSS vars on `.card-bg`.
  // For simplicity v0.1, emit a single gradient that reads --c-card-grad-*.
  return `<linearGradient id="card-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="${theme.dark.cardBgGradientStart}" />
      <stop offset="100%" stop-color="${theme.dark.cardBgGradientEnd}" />
    </linearGradient>`;
}

function coverShadow(): string {
  // Subtle inner shadow from top for that "polished cover art" look.
  return `<linearGradient id="cover-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="rgba(0, 0, 0, 0.35)" />
      <stop offset="40%"  stop-color="rgba(0, 0, 0, 0)" />
      <stop offset="100%" stop-color="rgba(0, 0, 0, 0.25)" />
    </linearGradient>`;
}

function coverPlaceholder(): string {
  return `<linearGradient id="cover-placeholder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>`;
}

function coverGlow(): string {
  return `<filter id="cover-glow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="rgba(0,0,0,0.4)" flood-opacity="1" />
    </filter>`;
}
