import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import {
  ClipSchema,
  OEmbedResponseSchema,
  PlaylistDetailSchema,
  ProfileResponseSchema,
} from '../src/schema.js';
import { loadFixture } from './_helpers.js';

describe('ClipSchema', () => {
  it('parses the real /api/clip/ fixture from P0 probing', () => {
    const raw = loadFixture('clip-complete.json');
    const result = v.safeParse(ClipSchema, raw);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.output.id).toBe('a885e43c-6918-456f-a5f0-0e8e29e61066');
    expect(result.output.title).toBe('冷酷史官的注脚');
    expect(result.output.is_public).toBe(true);
    expect(result.output.play_count).toBeGreaterThanOrEqual(0);
    expect(result.output.metadata.duration).toBeCloseTo(124.96, 1);
    expect(result.output.metadata.tags).toContain('Minimalist Piano');
    expect(result.output.metadata.model_badges?.songrow?.light?.text_color).toBe('7D7C83');
  });

  it('rejects missing required fields', () => {
    const result = v.safeParse(ClipSchema, { id: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('ProfileResponseSchema', () => {
  it('parses the real profile-page1 fixture (20 clips)', () => {
    const raw = loadFixture('profile-page1.json');
    const result = v.safeParse(ProfileResponseSchema, raw);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.output.handle).toBe('chanmeng');
    expect(result.output.clips).toHaveLength(20);
    // Counters are read live from Suno when the fixture is refreshed — assert
    // the parse and the shape, never a pinned number (2026-08-16: 736 → 768
    // plays and 26 → 28 clips in one refresh, which failed four test files for
    // no schema reason).
    expect(typeof result.output.num_total_clips).toBe('number');
    expect(result.output.num_total_clips).toBeGreaterThanOrEqual(result.output.clips.length);
    expect(typeof result.output.stats.play_count__sum).toBe('number');
    expect(result.output.stats.play_count__sum).toBeGreaterThan(0);
    expect(typeof result.output.stats.upvote_count__sum).toBe('number');
    expect(result.output.playlists).toHaveLength(1);
  });

  it('parses the real profile-page2 fixture (remaining 6 clips)', () => {
    const raw = loadFixture('profile-page2.json');
    const result = v.safeParse(ProfileResponseSchema, raw);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.output.clips.length).toBeLessThanOrEqual(20);
    expect(result.output.clips.length).toBeGreaterThan(0);
  });
});

describe('OEmbedResponseSchema', () => {
  it('parses the real /api/oembed fixture', () => {
    const raw = loadFixture('oembed-complete.json');
    const result = v.safeParse(OEmbedResponseSchema, raw);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.output.title).toBeTruthy();
    expect(result.output.iframe_url).toContain('/embed/');
  });
});

// ---------------------------------------------------------------------------
// `fixtures/trending.json` is an ARCHIVE. It was captured from the `/api/trending`
// route, which Suno removed on 2026-07-24. The playlist object behind that route
// is still public and still returns 200 at
// `/api/playlist/1190bf92-10dc-4ce5-968a-7a377f37f984`, and its membership has
// been frozen since September 2024 — so this capture stays useful as a shape
// sample. There is no fetcher for it; the only claim under test is that the
// schema still accepts the shape.
// ---------------------------------------------------------------------------
describe('PlaylistDetailSchema — archived Explore capture', () => {
  it('still parses the archived trending.json capture', () => {
    const raw = loadFixture('trending.json');
    const result = v.safeParse(PlaylistDetailSchema, raw);
    expect(result.success).toBe(true);
    if (!result.success) return;

    // The route carried no owner fields — that asymmetry is why every `user_*`
    // key on PlaylistDetailSchema is optional.
    expect(result.output.user_handle ?? null).toBeNull();
    expect(result.output.playlist_clips.length).toBeGreaterThan(0);
  });
});
