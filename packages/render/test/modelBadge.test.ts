import { type SunoSong, mapClipToSong } from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import { CARD_CSS } from '../src/cardCss.js';
import { renderSingleSongSvg } from '../src/cardStack.js';
import { renderModelBadgeHtml, renderSecondaryBadgesHtml } from '../src/modelBadge.js';
import { renderSongCard } from '../src/songCard.js';
import { loadClipResponse } from './_helpers.js';

const base = mapClipToSong(loadClipResponse(), 'clip');

function withTheme(theme: SunoSong['modelBadgeTheme'], extra: Partial<SunoSong> = {}): SunoSong {
  return { ...base, modelVersion: 'v6', modelBadgeTheme: theme, ...extra };
}

describe('renderModelBadgeHtml', () => {
  it('defaults missing bg/border to transparent (the 2026-09 text-only shape)', () => {
    const side = { text: '#A3A3A3', bg: null, border: null, gradient: null };
    const html = renderModelBadgeHtml(withTheme({ light: side, dark: side }));
    expect(html).toContain('--badge-text-light:#A3A3A3');
    expect(html).toContain('--badge-bg-light:transparent');
    expect(html).toContain('--badge-border-dark:transparent');
    expect(html).not.toContain('has-grad');
    expect(html).not.toContain('null');
  });

  it('keeps explicit bg/border from the older shape', () => {
    const side = {
      text: '#7D7C83',
      bg: 'rgba(0, 0, 0, 0.000)',
      border: 'rgba(0, 0, 0, 0.102)',
      gradient: null,
    };
    const html = renderModelBadgeHtml(withTheme({ light: side, dark: side }));
    expect(html).toContain('--badge-border-light:rgba(0, 0, 0, 0.102)');
  });

  it('emits gradient variables and the has-grad class when Suno sends stops', () => {
    const side = { text: '#FD429C', bg: null, border: null, gradient: ['#FD429C', '#FF5126'] };
    const html = renderModelBadgeHtml(withTheme({ light: side, dark: side }));
    expect(html).toContain('class="badge-model badge-model-suno has-grad"');
    expect(html).toContain('--badge-grad-light:linear-gradient(90deg, #FD429C, #FF5126)');
    expect(html).toContain('--badge-grad-dark:linear-gradient(90deg, #FD429C, #FF5126)');
  });

  it('repeats a single gradient stop so the CSS stays valid', () => {
    const side = { text: '#111111', bg: null, border: null, gradient: ['#111111'] };
    const html = renderModelBadgeHtml(withTheme({ light: side, dark: side }));
    expect(html).toContain('linear-gradient(90deg, #111111, #111111)');
  });

  it('falls back to theme tokens when the clip has no badge colours', () => {
    expect(renderModelBadgeHtml(withTheme(null))).toContain('badge-model-fallback');
  });
});

describe('badge CSS follows the card theme', () => {
  it('marks the root with the resolved theme mode', () => {
    expect(renderSingleSongSvg(base, { theme: 'dark' })).toContain('class="card-root theme-dark"');
    expect(renderSingleSongSvg(base, { theme: 'light' })).toContain(
      'class="card-root theme-light"',
    );
    expect(renderSingleSongSvg(base, { theme: 'auto' })).toContain('class="card-root theme-auto"');
  });

  it('switches to dark tokens under a pinned dark theme, and by media query only under auto', () => {
    expect(CARD_CSS).toMatch(/\.theme-dark \.badge-model-suno\s*\{[^}]*--badge-text-dark/);
    expect(CARD_CSS).toMatch(
      /@media \(prefers-color-scheme: dark\)\s*\{\s*\.theme-auto \.badge-model-suno/,
    );
    // No unscoped dark override that would leak into theme=light.
    expect(CARD_CSS).not.toMatch(/prefers-color-scheme: dark\)\s*\{\s*\.badge-model-suno/);
  });

  it('draws gradients with background-clip:text, guarded by @supports', () => {
    expect(CARD_CSS).toContain(
      '@supports ((-webkit-background-clip: text) or (background-clip: text))',
    );
    expect(CARD_CSS).toMatch(/\.badge-model-suno\.has-grad\s*\{[^}]*background-clip: text/);
  });
});

describe('secondary badges', () => {
  const badges = [
    { key: 'cover', label: 'Cover' },
    { key: 'full_song', label: 'Full Song' },
  ];

  it('renders one neutral chip per badge', () => {
    const html = renderSecondaryBadgesHtml({ ...base, secondaryBadges: badges });
    expect(html).toContain('<span class="badge-secondary" data-key="cover">Cover</span>');
    expect(html).toContain('>Full Song</span>');
  });

  it('renders nothing for null or empty', () => {
    expect(renderSecondaryBadgesHtml({ ...base, secondaryBadges: null })).toBe('');
    expect(renderSecondaryBadgesHtml({ ...base, secondaryBadges: [] })).toBe('');
  });

  it('is off by default on the classic card, and on when asked', () => {
    const song = { ...base, secondaryBadges: badges };
    expect(renderSongCard(song)).not.toContain('badge-secondary');
    expect(renderSongCard(song, { showSecondaryBadges: true })).toContain('badge-secondary');
  });

  it('still renders the chips when the model badge is hidden', () => {
    const song = { ...base, secondaryBadges: badges };
    const svg = renderSongCard(song, { showSecondaryBadges: true, showModelBadge: false });
    expect(svg).toContain('meta-footer');
    expect(svg).not.toContain('badge-model');
  });
});
