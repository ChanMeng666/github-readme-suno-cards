import { describe, expect, it } from 'vitest';
import {
  DEFAULT_THEME,
  SUNO_PRESET,
  resolvePreset,
  resolveTheme,
  themeCss,
} from '../src/themes.js';

describe('resolveTheme', () => {
  it('returns DEFAULT_THEME unchanged when no overrides', () => {
    const r = resolveTheme('auto');
    expect(r.dark.bg).toBe(DEFAULT_THEME.dark.bg);
    expect(r.light.bg).toBe(DEFAULT_THEME.light.bg);
  });
  it('applies color overrides to both modes', () => {
    const r = resolveTheme('auto', { accent: '#ff0000' });
    expect(r.dark.accent).toBe('#ff0000');
    expect(r.light.accent).toBe('#ff0000');
  });
  it('preserves mode', () => {
    expect(resolveTheme('dark').mode).toBe('dark');
    expect(resolveTheme('light').mode).toBe('light');
  });
});

describe('themeCss', () => {
  it('emits only one :root block for dark mode', () => {
    const css = themeCss(resolveTheme('dark'));
    expect(css).toContain(':root');
    expect(css).not.toContain('@media');
  });
  it('emits @media prefers-color-scheme for auto mode', () => {
    const css = themeCss(resolveTheme('auto'));
    expect(css).toContain('@media (prefers-color-scheme: dark)');
    expect(css).toMatch(/--c-bg:/);
  });
  it('includes all custom properties', () => {
    const css = themeCss(resolveTheme('auto'));
    for (const v of [
      '--c-bg',
      '--c-text',
      '--c-subtext',
      '--c-accent',
      '--c-chip-bg',
      '--c-bar',
      '--c-progress-track',
      '--c-scrubber',
    ]) {
      expect(css).toContain(v);
    }
  });
});

describe('SUNO_PRESET', () => {
  it('has gold accent color', () => {
    expect(SUNO_PRESET.dark.accent).toBe('#fbd38d');
    expect(SUNO_PRESET.dark.barColor).toBe('#fbd38d');
  });

  it('has navy card background colors', () => {
    expect(SUNO_PRESET.dark.cardBg).toBe('#1d264b');
    expect(SUNO_PRESET.dark.cardBgGradientStart).toBe('#1e295e');
  });

  it('has progressTrack and scrubber fields', () => {
    expect(SUNO_PRESET.dark.progressTrack).toBeDefined();
    expect(SUNO_PRESET.dark.scrubber).toBeDefined();
  });
});

describe('resolvePreset', () => {
  it('returns DEFAULT_THEME for "default"', () => {
    expect(resolvePreset('default')).toBe(DEFAULT_THEME);
  });

  it('returns SUNO_PRESET for "suno"', () => {
    expect(resolvePreset('suno')).toBe(SUNO_PRESET);
  });

  it('returns DEFAULT_THEME when no name given', () => {
    expect(resolvePreset()).toBe(DEFAULT_THEME);
  });
});
