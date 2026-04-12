import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, resolveTheme, themeCss } from '../src/themes.js';

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
    for (const v of ['--c-bg', '--c-text', '--c-subtext', '--c-accent', '--c-chip-bg', '--c-bar']) {
      expect(css).toContain(v);
    }
  });
});
