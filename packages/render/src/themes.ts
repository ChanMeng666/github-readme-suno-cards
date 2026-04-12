/**
 * Color tokens for the card. A theme is a pair (dark, light).
 * The default theme pulls from Suno's brand palette — deep near-black
 * with a violet accent that matches their logo.
 */
export type ThemeColors = {
  bg: string;
  cardBg: string;
  cardBgGradientStart: string;
  cardBgGradientEnd: string;
  text: string;
  subtext: string;
  accent: string;
  accentGlow: string;
  border: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  barColor: string;
};

export type Theme = {
  name: string;
  dark: ThemeColors;
  light: ThemeColors;
};

export const DEFAULT_THEME: Theme = {
  name: 'default',
  dark: {
    bg: '#0a0a0f',
    cardBg: '#12121a',
    cardBgGradientStart: '#1a1a26',
    cardBgGradientEnd: '#0f0f17',
    text: '#f5f5f7',
    subtext: '#a1a1aa',
    accent: '#8b5cf6',
    accentGlow: 'rgba(139, 92, 246, 0.45)',
    border: 'rgba(255, 255, 255, 0.08)',
    chipBg: 'rgba(139, 92, 246, 0.14)',
    chipText: '#c4b5fd',
    chipBorder: 'rgba(139, 92, 246, 0.3)',
    barColor: '#a78bfa',
  },
  light: {
    bg: '#ffffff',
    cardBg: '#ffffff',
    cardBgGradientStart: '#fafafa',
    cardBgGradientEnd: '#f4f4f5',
    text: '#18181b',
    subtext: '#71717a',
    accent: '#7c3aed',
    accentGlow: 'rgba(124, 58, 237, 0.3)',
    border: 'rgba(0, 0, 0, 0.08)',
    chipBg: 'rgba(124, 58, 237, 0.08)',
    chipText: '#6d28d9',
    chipBorder: 'rgba(124, 58, 237, 0.2)',
    barColor: '#7c3aed',
  },
};

export type ColorOverrides = {
  bg?: string;
  text?: string;
  subtext?: string;
  accent?: string;
  border?: string;
};

export type ThemeMode = 'auto' | 'dark' | 'light';

export type ResolvedTheme = {
  mode: ThemeMode;
  dark: ThemeColors;
  light: ThemeColors;
};

export function resolveTheme(
  mode: ThemeMode = 'auto',
  overrides: ColorOverrides = {},
  base: Theme = DEFAULT_THEME,
): ResolvedTheme {
  const applyOverrides = (colors: ThemeColors): ThemeColors => ({
    ...colors,
    ...(overrides.bg && { bg: overrides.bg, cardBg: overrides.bg }),
    ...(overrides.text && { text: overrides.text }),
    ...(overrides.subtext && { subtext: overrides.subtext }),
    ...(overrides.accent && {
      accent: overrides.accent,
      barColor: overrides.accent,
      chipText: overrides.accent,
    }),
    ...(overrides.border && { border: overrides.border }),
  });

  return {
    mode,
    dark: applyOverrides(base.dark),
    light: applyOverrides(base.light),
  };
}

/**
 * Build a CSS block that defines `--c-*` custom properties for both modes,
 * respecting `prefers-color-scheme` when mode is 'auto'. When mode is pinned
 * to 'dark' or 'light', only that variant's tokens are emitted.
 */
export function themeCss(theme: ResolvedTheme): string {
  const asVars = (c: ThemeColors): string => `
      --c-bg: ${c.bg};
      --c-card-bg: ${c.cardBg};
      --c-card-grad-start: ${c.cardBgGradientStart};
      --c-card-grad-end: ${c.cardBgGradientEnd};
      --c-text: ${c.text};
      --c-subtext: ${c.subtext};
      --c-accent: ${c.accent};
      --c-accent-glow: ${c.accentGlow};
      --c-border: ${c.border};
      --c-chip-bg: ${c.chipBg};
      --c-chip-text: ${c.chipText};
      --c-chip-border: ${c.chipBorder};
      --c-bar: ${c.barColor};`;

  if (theme.mode === 'dark') {
    return `
    :root {${asVars(theme.dark)}
    }`;
  }
  if (theme.mode === 'light') {
    return `
    :root {${asVars(theme.light)}
    }`;
  }
  return `
    :root {${asVars(theme.light)}
    }
    @media (prefers-color-scheme: dark) {
      :root {${asVars(theme.dark)}
      }
    }`;
}
