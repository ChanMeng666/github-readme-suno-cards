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

// ---------------------------------------------------------------------------
// `fixtures/editorial-shelf.json` — Suno's live curated Explore surface.
//
// A TRIMMED capture of the public "Staff Picks" playlist (2026-08-23). The
// upstream shelf carried 22 clips; this fixture keeps **one clip per distinct
// shape combination** of (`metadata.type`, has `model_badges`, has
// `secondary_badges`), which is the property under test. It deliberately does
// NOT preserve the upstream k/N ratios — assert *kinds* here, never counts.
//
// A curated shelf is the one place Suno ships a genuinely heterogeneous clip
// array: alongside ordinary generations it carries human uploads and studio
// exports, which have a much smaller `metadata` and no model badge at all. Any
// tool that samples element [0] of such an array and calls it "the shape" will
// eventually report a pile of fields as removed. That is not hypothetical — it
// is why this fixture exists.
// ---------------------------------------------------------------------------
describe('PlaylistDetailSchema — editorial shelf (heterogeneous)', () => {
  const raw = loadFixture<{ playlist_clips: { clip: Record<string, unknown> }[] }>(
    'editorial-shelf.json',
  );

  it('parses the shelf shape with no schema errors', () => {
    const result = v.safeParse(PlaylistDetailSchema, raw);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.output.playlist_clips.length).toBeGreaterThan(0);
  });

  it('is heterogeneous — more than one clip shape in a single array', () => {
    const shapes = new Set(
      raw.playlist_clips.map((pc) => Object.keys(pc.clip.metadata as object).length),
    );
    // If this ever collapses to one, the fixture stopped testing what it is for.
    expect(shapes.size).toBeGreaterThan(1);
  });

  it('omits model_badges exactly when no model generated the clip', () => {
    const clips = raw.playlist_clips.map((pc) => pc.clip);
    const without = clips.filter((c) => !('model_badges' in (c.metadata as object)));
    const withBadges = clips.filter((c) => 'model_badges' in (c.metadata as object));
    expect(without.length).toBeGreaterThan(0);
    expect(withBadges.length).toBeGreaterThan(0);

    // Key on the ABSENCE OF A GENERATING MODEL, never on `metadata.type`. An
    // earlier revision asserted `type === 'upload'` here and a later sample
    // falsified it: `studio_export` clips have no model badge either, because
    // they are user-arranged audio. `type` was a proxy for the real invariant.
    for (const c of without) {
      expect(c.model_name).toBe('chirp-chirp');
      expect(c.major_model_version).toBe('');
    }
    for (const c of withBadges) {
      expect(c.model_name).not.toBe('chirp-chirp');
      expect(c.major_model_version).not.toBe('');
    }
  });

  it('treats secondary_badges as a property of the clip, not of the shape', () => {
    const clips = raw.playlist_clips.map((pc) => pc.clip);
    const withSecondary = clips.filter((c) => 'secondary_badges' in (c.metadata as object));
    // Present on some and absent on others *within one response* — so an absence
    // is ordinary heterogeneity, not a truncated serializer. (It is also the one
    // field Suno varies by User-Agent; see the note on the schema field.)
    expect(withSecondary.length).toBeGreaterThan(0);
    expect(withSecondary.length).toBeLessThan(clips.length);
  });

  it('carries the media_urls delivery manifest on every clip', () => {
    const result = v.safeParse(PlaylistDetailSchema, raw);
    expect(result.success).toBe(true);
    if (!result.success) return;

    for (const pc of result.output.playlist_clips) {
      const tiers = pc.clip.media_urls;
      expect(tiers, `clip ${pc.clip.id} has no media_urls`).toBeDefined();
      const types = (tiers ?? []).map((t) => t.content_type).sort();
      expect(types).toEqual(['m4a-opus', 'mp3']);

      // The mp3 entry is exactly `audio_url` — nothing new to store. This is the
      // assertion that keeps anyone from "upgrading" a player to the opus tier:
      // that payload is opaque and will not decode. See the schema comment.
      const mp3 = (tiers ?? []).find((t) => t.content_type === 'mp3');
      expect(mp3?.url).toBe(pc.clip.audio_url);
    }
  });
});
