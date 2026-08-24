import { describe, expect, it } from 'vitest';
import { SUNO_CDN_ALLOWED_WIDTHS, resizeSunoCover } from '../src/cdn.js';

const COVER = 'https://cdn2.suno.ai/image_a885e43c-6918-456f-a5f0-0e8e29e61066.jpeg';
const LARGE = 'https://cdn2.suno.ai/image_large_a885e43c-6918-456f-a5f0-0e8e29e61066.jpeg';

describe('resizeSunoCover', () => {
  it('snaps UP to the nearest allowed width', () => {
    // The whole point: Suno 403s any width outside the whitelist, so 240 must
    // become 256, never 240.
    expect(resizeSunoCover(COVER, 240)).toBe(`${COVER}?width=256`);
    expect(resizeSunoCover(COVER, 120)).toBe(`${COVER}?width=256`);
    expect(resizeSunoCover(COVER, 100)).toBe(`${COVER}?width=100`);
    expect(resizeSunoCover(COVER, 101)).toBe(`${COVER}?width=256`);
    expect(resizeSunoCover(COVER, 300)).toBe(`${COVER}?width=360`);
  });

  it('only ever emits whitelisted widths', () => {
    for (let w = 1; w <= 719; w++) {
      const out = resizeSunoCover(COVER, w);
      const width = Number(new URL(out).searchParams.get('width'));
      expect(SUNO_CDN_ALLOWED_WIDTHS).toContain(width as (typeof SUNO_CDN_ALLOWED_WIDTHS)[number]);
      expect(width).toBeGreaterThanOrEqual(w);
    }
  });

  it('returns the original for 720 and above — no point downscaling', () => {
    expect(resizeSunoCover(COVER, 720)).toBe(COVER);
    expect(resizeSunoCover(COVER, 1200)).toBe(COVER);
  });

  it('handles the large-cover path too', () => {
    expect(resizeSunoCover(LARGE, 200)).toBe(`${LARGE}?width=256`);
  });

  it('passes non-Suno URLs through untouched', () => {
    // oEmbed can return a thumbnail on someone else's host; adding ?width= there
    // would be meaningless at best and cache-busting at worst.
    const foreign = 'https://example.com/cover.jpg';
    expect(resizeSunoCover(foreign, 120)).toBe(foreign);
    expect(resizeSunoCover('https://cdn1.suno.ai/x.mp3', 120)).toBe('https://cdn1.suno.ai/x.mp3');
    expect(resizeSunoCover('https://cdn2.suno.ai/not-a-cover.jpeg', 120)).toBe(
      'https://cdn2.suno.ai/not-a-cover.jpeg',
    );
  });

  it('is safe on empty, null and unparseable input', () => {
    expect(resizeSunoCover(null, 120)).toBe('');
    expect(resizeSunoCover(undefined, 120)).toBe('');
    expect(resizeSunoCover('', 120)).toBe('');
    expect(resizeSunoCover('not a url', 120)).toBe('not a url');
    expect(resizeSunoCover(COVER, Number.NaN)).toBe(COVER);
    expect(resizeSunoCover(COVER, 0)).toBe(COVER);
    expect(resizeSunoCover(COVER, -5)).toBe(COVER);
  });

  it('replaces an existing width rather than appending a second one', () => {
    expect(resizeSunoCover(`${COVER}?width=720`, 120)).toBe(`${COVER}?width=256`);
  });
});
