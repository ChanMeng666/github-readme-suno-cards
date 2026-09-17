import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import { mapClipToSong, normalizeMediaUrl } from '../src/mapping.js';
import { ClipSchema } from '../src/schema.js';
import { loadFixture } from './_helpers.js';

function clipWith(metadata: Record<string, unknown>) {
  const raw = loadFixture<Record<string, unknown> & { metadata: Record<string, unknown> }>(
    'clip-complete.json',
  );
  const result = v.safeParse(ClipSchema, { ...raw, metadata: { ...raw.metadata, ...metadata } });
  if (!result.success) throw new Error('fixture failed schema');
  return result.output;
}

describe('normalizeMediaUrl', () => {
  it('drops the /api/forbidden placeholder Suno sends instead of an mp3', () => {
    expect(normalizeMediaUrl('https://studio-api.prod.suno.com/api/forbidden')).toBeNull();
    expect(normalizeMediaUrl('https://studio-api.prod.suno.com/api/forbidden/')).toBeNull();
  });

  it('drops empty, malformed and non-http values', () => {
    expect(normalizeMediaUrl('')).toBeNull();
    expect(normalizeMediaUrl(null)).toBeNull();
    expect(normalizeMediaUrl(undefined)).toBeNull();
    expect(normalizeMediaUrl('not a url')).toBeNull();
    expect(normalizeMediaUrl('data:audio/mpeg;base64,AAAA')).toBeNull();
  });

  it('passes a real media URL through untouched', () => {
    const url = 'https://cdn1.suno.ai/a885e43c-6918-456f-a5f0-0e8e29e61066.mp3';
    expect(normalizeMediaUrl(url)).toBe(url);
  });
});

describe('mapClipToSong — badges', () => {
  it('maps a text-only badge with null bg, border and gradient', () => {
    const side = { text_color: 'A3A3A3' };
    const song = mapClipToSong(
      clipWith({ model_badges: { songrow: { light: side, dark: side } } }),
      'clip',
    );
    expect(song.modelBadgeTheme?.light).toEqual({
      text: '#A3A3A3',
      bg: null,
      border: null,
      gradient: null,
    });
  });

  it('maps the pre-2026-09 shape, converting ARGB hex to rgba()', () => {
    const side = { text_color: '7D7C83', background_color: '00000000', border_color: '0000001A' };
    const song = mapClipToSong(
      clipWith({ model_badges: { songrow: { light: side, dark: side } } }),
      'clip',
    );
    expect(song.modelBadgeTheme?.dark.bg).toBe('rgba(0, 0, 0, 0.000)');
    expect(song.modelBadgeTheme?.dark.border).toBe('rgba(0, 0, 0, 0.102)');
    expect(song.modelBadgeTheme?.dark.gradient).toBeNull();
  });

  it('maps gradient stops through the same hex conversion', () => {
    const side = { text_color: 'FD429C', text_color_gradient: ['FD429C', 'FF5126'] };
    const song = mapClipToSong(
      clipWith({ model_badges: { songrow: { light: side, dark: side } } }),
      'clip',
    );
    expect(song.modelBadgeTheme?.light.gradient).toEqual(['#FD429C', '#FF5126']);
  });

  it('prefers songrow, and falls back to songcard only when songrow is absent', () => {
    const row = { text_color: '111111' };
    const card = { text_color: '222222', background_color: '0000004D' };
    const both = mapClipToSong(
      clipWith({
        model_badges: {
          songrow: { light: row, dark: row },
          songcard: { light: card, dark: card },
        },
      }),
      'clip',
    );
    expect(both.modelBadgeTheme?.light.text).toBe('#111111');

    const cardOnly = mapClipToSong(
      clipWith({ model_badges: { songcard: { light: card, dark: card } } }),
      'clip',
    );
    expect(cardOnly.modelBadgeTheme?.light.text).toBe('#222222');
    expect(cardOnly.modelBadgeTheme?.light.bg).toBe('rgba(0, 0, 0, 0.302)');
  });

  it('is null when a badge lacks either colour scheme', () => {
    const song = mapClipToSong(
      clipWith({ model_badges: { songrow: { light: { text_color: 'A3A3A3' } } } }),
      'clip',
    );
    expect(song.modelBadgeTheme).toBeNull();
  });
});

describe('mapClipToSong — secondary badges', () => {
  it('is null when Suno did not send the key', () => {
    const song = mapClipToSong(clipWith({ secondary_badges: undefined }), 'clip');
    expect(song.secondaryBadges).toBeNull();
  });

  it('is [] for an empty list', () => {
    expect(mapClipToSong(clipWith({ secondary_badges: [] }), 'clip').secondaryBadges).toEqual([]);
  });

  it('keys on icon_key, falls back to display_name, and title-cases the label', () => {
    const song = mapClipToSong(
      clipWith({
        secondary_badges: [
          { icon_key: 'uploaded', display_name: 'UPLOAD' },
          { display_name: 'COVER' },
          { icon_key: 'full_song', display_name: 'FULL SONG' },
          { icon_key: 'full_song' },
          {},
        ],
      }),
      'clip',
    );
    expect(song.secondaryBadges).toEqual([
      { key: 'uploaded', label: 'Upload' },
      { key: 'cover', label: 'Cover' },
      { key: 'full_song', label: 'Full Song' },
      { key: 'full_song', label: 'Full Song' },
    ]);
  });
});
