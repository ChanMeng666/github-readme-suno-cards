import { mapClipToSong } from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import { renderSingleSongSvg } from '../src/cardStack.js';
import { PLAYER_CARD_DEFAULT_WIDTH, renderSongCard } from '../src/songCard.js';
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
    // Auto theme emits paired gradients for light/dark switching
    expect(svg).toContain('id="card-gradient-light"');
    expect(svg).toContain('id="card-gradient-dark"');
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

describe('renderSongCard — player layout', () => {
  const clip = loadClipResponse();
  const song = mapClipToSong(clip, 'clip');

  it('renders progress bar and play button by default', () => {
    const svg = renderSongCard(song, { layout: 'player' });
    expect(svg).toContain('class="progress-bar"');
    expect(svg).toContain('class="play-btn-circle"');
    expect(svg).toContain('class="progress-track"');
    expect(svg).toContain('class="progress-scrubber"');
  });

  it('renders SUNO logo by default', () => {
    const svg = renderSongCard(song, { layout: 'player' });
    expect(svg).toContain('class="suno-logo"');
    expect(svg).toContain('>SUNO<');
  });

  it('renders link icon by default', () => {
    const svg = renderSongCard(song, { layout: 'player' });
    expect(svg).toContain('class="link-icon"');
  });

  it('keeps equalizer bars by default in player layout', () => {
    const svg = renderSongCard(song, { layout: 'player' });
    expect(svg).toContain('class="equalizer"');
  });

  it('renders the song title', () => {
    const svg = renderSongCard(song, { layout: 'player' });
    expect(svg).toContain('冷酷史官的注脚');
    expect(svg).toContain('class="player-title"');
  });

  it('does not render tags/stats by default in player layout', () => {
    const svg = renderSongCard(song, { layout: 'player' });
    expect(svg).not.toContain('class="chips"');
    expect(svg).not.toContain('class="stats-row"');
  });

  it('hides progress bar when disabled', () => {
    const svg = renderSongCard(song, { layout: 'player', showProgress: false });
    expect(svg).not.toContain('class="progress-bar"');
  });

  it('hides SUNO logo when disabled', () => {
    const svg = renderSongCard(song, { layout: 'player', showLogo: false });
    expect(svg).not.toContain('class="suno-logo"');
  });

  it('embeds a data URI cover when provided', () => {
    const svg = renderSongCard(song, {
      layout: 'player',
      coverDataUri: 'data:image/jpeg;base64,AAAA',
    });
    expect(svg).toContain('data:image/jpeg;base64,AAAA');
    expect(svg).toContain('<image');
  });
});

describe('renderSingleSongSvg — player layout', () => {
  const clip = loadClipResponse();
  const song = mapClipToSong(clip, 'clip');

  it('uses wider default dimensions for player layout', () => {
    const svg = renderSingleSongSvg(song, { layout: 'player' });
    expect(svg).toContain(`width="${PLAYER_CARD_DEFAULT_WIDTH}"`);
  });

  it('applies suno preset colors when specified', () => {
    const svg = renderSingleSongSvg(song, { layout: 'player', preset: 'suno', theme: 'dark' });
    expect(svg).toContain('#fbd38d'); // gold accent
    expect(svg).toContain('#1e295e'); // navy gradient
  });
});
