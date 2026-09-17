import { mapClipToSong } from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import { ANIMATION_CSS } from '../src/animations.js';
import { renderNewBadge } from '../src/newBadge.js';
import { COVER_SIZE, PLAYER_COVER_SIZE, renderSongCard } from '../src/songCard.js';
import { loadClipResponse } from './_helpers.js';

// A CSS `transform` replaces an SVG `transform` attribute instead of composing
// with it. With the translate and the pulse animation on one element, the
// ribbon lost its position mid-pulse and was clipped to "EW" at the card edge.
describe('renderNewBadge', () => {
  it('keeps the position and the animated class on separate groups', () => {
    const svg = renderNewBadge(86, 18, 'en');
    expect(svg).toMatch(/^<g transform="translate\(86, 18\)"[^>]*>\s*<g class="new-badge">/);
    expect(svg).not.toMatch(/class="new-badge"[^>]*transform=/);
    expect(svg).not.toMatch(/transform=[^>]*class="new-badge"/);
  });

  it('scales about its own box, not the SVG view box', () => {
    expect(ANIMATION_CSS).toMatch(/\.new-badge\s*\{[^}]*transform-box: fill-box/);
  });
});

describe('NEW ribbon stays inside the cover', () => {
  const song = { ...mapClipToSong(loadClipResponse(), 'clip'), isNew: true };
  const RIBBON_W = 38;
  const RIBBON_H = 18;
  const PULSE = 1.08;

  for (const [layout, coverSize, padding] of [
    ['classic', COVER_SIZE, 10],
    ['player', PLAYER_COVER_SIZE, 15],
  ] as const) {
    it(`in the ${layout} layout, including at peak pulse`, () => {
      const svg = renderSongCard(song, { layout, showNewBadge: true });
      const m = svg.match(/<g transform="translate\(([\d.]+), ([\d.]+)\)" aria-hidden="true">/);
      expect(m).not.toBeNull();
      const x = Number(m?.[1]);
      const y = Number(m?.[2]);
      const height = layout === 'player' ? 160 : 140;
      const coverX = padding;
      const coverY = (height - coverSize) / 2;
      const growX = (RIBBON_W * (PULSE - 1)) / 2;
      const growY = (RIBBON_H * (PULSE - 1)) / 2;
      expect(x - growX).toBeGreaterThanOrEqual(coverX);
      expect(y - growY).toBeGreaterThanOrEqual(coverY);
      expect(x + RIBBON_W + growX).toBeLessThanOrEqual(coverX + coverSize);
      expect(y + RIBBON_H + growY).toBeLessThanOrEqual(coverY + coverSize);
    });
  }
});
