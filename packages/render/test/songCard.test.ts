import { mapClipToSong } from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import { renderSingleSongSvg } from '../src/cardStack.js';
import { renderSongCard } from '../src/songCard.js';
import { loadClipResponse } from './_helpers.js';

describe('renderSongCard', () => {
  const clip = loadClipResponse();
  const song = mapClipToSong(clip, 'clip');

  it('emits a <g class="song-card"> group', () => {
    const svg = renderSongCard(song);
    expect(svg).toContain('<g class="song-card"');
    expect(svg).toContain('<foreignObject');
  });

  it('renders the song title verbatim (CJK-safe)', () => {
    const svg = renderSongCard(song);
    expect(svg).toContain('冷酷史官的注脚');
  });

  it('includes the author display name', () => {
    const svg = renderSongCard(song);
    expect(svg).toContain('Chan');
    expect(svg).toContain('@chanmeng');
  });

  it('includes classified tag chips from the fixture', () => {
    const svg = renderSongCard(song);
    expect(svg).toContain('<div class="chips">');
    // We know the fixture contains "Ambient" as a genre
    expect(svg).toContain('Ambient');
  });

  it('renders play/like counts via format helpers', () => {
    const svg = renderSongCard(song);
    expect(svg).toContain(String(song.playCount));
    expect(svg).toContain(String(song.likeCount));
  });

  it('renders the duration pill with M:SS', () => {
    const svg = renderSongCard(song);
    expect(svg).toContain('2:05'); // 124.96s → 2:05
    expect(svg).toContain('duration-pill');
  });

  it('includes the animated equalizer bars', () => {
    const svg = renderSongCard(song);
    expect(svg).toContain('class="equalizer"');
    expect(svg).toContain('class="eq-bar eq-bar-1"');
    expect(svg).toContain('class="eq-bar eq-bar-4"');
  });

  it('uses the Suno-native model badge tokens', () => {
    const svg = renderSongCard(song);
    expect(svg).toContain('badge-model-suno');
    expect(svg).toContain('--badge-text-light:');
    expect(svg).toContain('--badge-text-dark:');
  });

  it('translates "by" into Chinese when lang=zh', () => {
    const svg = renderSongCard(song, { lang: 'zh' });
    expect(svg).toContain('作者');
  });

  it('omits equalizer when disabled', () => {
    const svg = renderSongCard(song, { showEqualizer: false });
    expect(svg).not.toContain('class="equalizer"');
  });

  it('embeds a data URI cover when provided', () => {
    const svg = renderSongCard(song, { coverDataUri: 'data:image/jpeg;base64,AAAA' });
    expect(svg).toContain('data:image/jpeg;base64,AAAA');
    expect(svg).toContain('<image');
  });

  it('renders fallback placeholder when cover is missing', () => {
    const svg = renderSongCard(song, { coverDataUri: null });
    expect(svg).toContain('cover-placeholder');
    expect(svg).toContain('♪');
  });
});

describe('renderSingleSongSvg', () => {
  const clip = loadClipResponse();
  const song = mapClipToSong(clip, 'clip');

  it('wraps the song card in a full SVG root with defs and style', () => {
    const svg = renderSingleSongSvg(song);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('<defs>');
    expect(svg).toContain('<style>');
    expect(svg).toContain('id="card-gradient"');
    expect(svg).toContain('id="cover-shadow"');
    expect(svg).toContain('@keyframes bar-bounce');
  });

  it('emits TWO :root blocks under auto theme (base + dark media query)', () => {
    // One for themeCss light base, one for themeCss dark media query.
    // CARD_CSS also has a media query for the Suno badge, so we count :root
    // blocks directly to isolate themeCss behavior.
    const svg = renderSingleSongSvg(song, { theme: 'auto' });
    const rootBlocks = svg.match(/:root\s*\{/g) ?? [];
    expect(rootBlocks.length).toBe(2);
  });

  it('emits ONE :root block when theme is pinned to dark', () => {
    const svg = renderSingleSongSvg(song, { theme: 'dark' });
    const rootBlocks = svg.match(/:root\s*\{/g) ?? [];
    expect(rootBlocks.length).toBe(1);
    expect(svg).toContain('--c-bg:');
  });
});
