import { describe, expect, it } from 'vitest';
import { fetchClip } from '../src/clip.js';
import {
  SunoNotFoundError,
  SunoNotReadyError,
  SunoPrivateError,
  SunoSchemaError,
} from '../src/errors.js';
import { loadFixture, mockFetchJson } from './_helpers.js';

const UUID = 'a885e43c-6918-456f-a5f0-0e8e29e61066';
const CLIP_URL = `https://studio-api-prod.suno.com/api/clip/${UUID}`;

describe('fetchClip', () => {
  it('returns a normalized SunoSong from the real fixture', async () => {
    const body = loadFixture('clip-complete.json');
    const song = await fetchClip(UUID, { fetchImpl: mockFetchJson(CLIP_URL, 200, body) });

    expect(song.id).toBe(UUID);
    expect(song.title).toBe('冷酷史官的注脚');
    expect(song.status).toBe('complete');
    expect(song.isPublic).toBe(true);
    expect(song.author.displayName).toBe('Chan');
    expect(song.author.handle).toBe('chanmeng');
    expect(song.coverUrl).toContain('cdn2.suno.ai');
    expect(song.audioUrl).toContain('cdn1.suno.ai');
    expect(song.tags.length).toBeGreaterThan(5);
    expect(song.durationSeconds).toBeCloseTo(124.96, 1);
    expect(song.modelVersion).toBe('v4.5-all');
    expect(song.modelBadgeTheme?.light.text).toBeTruthy();
    expect(song.modelBadgeTheme?.dark.text).toBeTruthy();
    expect(song.classifiedTags.instrument).toContain('Minimalist Piano');
    expect(song.shareUrl).toBe(`https://suno.com/song/${UUID}`);
    expect(song.embedUrl).toBe(`https://suno.com/embed/${UUID}`);
    expect(song.source).toBe('clip');
  });

  it('maps 404 to SunoNotFoundError', async () => {
    await expect(
      fetchClip(UUID, { fetchImpl: mockFetchJson(CLIP_URL, 404, { error: 'not found' }) }),
    ).rejects.toBeInstanceOf(SunoNotFoundError);
  });

  it('maps 403 to SunoPrivateError', async () => {
    await expect(
      fetchClip(UUID, { fetchImpl: mockFetchJson(CLIP_URL, 403, { error: 'forbidden' }) }),
    ).rejects.toBeInstanceOf(SunoPrivateError);
  });

  it('throws SunoPrivateError when is_public=false', async () => {
    const body = {
      ...loadFixture<Record<string, unknown>>('clip-complete.json'),
      is_public: false,
    };
    await expect(
      fetchClip(UUID, { fetchImpl: mockFetchJson(CLIP_URL, 200, body) }),
    ).rejects.toBeInstanceOf(SunoPrivateError);
  });

  it('throws SunoNotReadyError when status != complete', async () => {
    const body = {
      ...loadFixture<Record<string, unknown>>('clip-complete.json'),
      status: 'queued',
    };
    await expect(
      fetchClip(UUID, { fetchImpl: mockFetchJson(CLIP_URL, 200, body) }),
    ).rejects.toBeInstanceOf(SunoNotReadyError);
  });

  it('throws SunoSchemaError on invalid body', async () => {
    await expect(
      fetchClip(UUID, { fetchImpl: mockFetchJson(CLIP_URL, 200, { garbage: true }) }),
    ).rejects.toBeInstanceOf(SunoSchemaError);
  });
});
