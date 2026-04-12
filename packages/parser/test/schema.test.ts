import * as v from 'valibot';
import { describe, expect, it } from 'vitest';
import { ClipSchema, OEmbedResponseSchema, ProfileResponseSchema } from '../src/schema.js';
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
    expect(result.output.num_total_clips).toBe(26);
    expect(result.output.clips).toHaveLength(20);
    expect(result.output.stats.play_count__sum).toBe(736);
    expect(result.output.stats.upvote_count__sum).toBe(55);
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
