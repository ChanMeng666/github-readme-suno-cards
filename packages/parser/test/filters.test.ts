import { describe, expect, it } from 'vitest';
import { filterAndRank } from '../src/filters.js';
import type { SunoSong } from '../src/schema.js';

function makeSong(overrides: Partial<SunoSong> = {}): SunoSong {
  const base: SunoSong = {
    id: '00000000-0000-0000-0000-000000000000',
    title: 'Song',
    status: 'complete',
    isPublic: true,
    isPinned: false,
    explicit: false,
    author: { displayName: 'Test', handle: 'test', avatarUrl: null, userId: 'u1' },
    coverUrl: '',
    coverLargeUrl: '',
    audioUrl: '',
    videoUrl: null,
    tags: [],
    classifiedTags: {
      genre: [],
      era: [],
      instrument: [],
      mood: [],
      vocal: [],
      key: [],
      production: [],
      tempo: [],
      other: [],
    },
    lyrics: null,
    durationSeconds: 100,
    playCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    isNew: false,
    modelVersion: 'v4.5-all',
    modelName: 'chirp-auk',
    modelBadgeTheme: null,
    shareUrl: '',
    embedUrl: '',
    source: 'profile',
  };
  return { ...base, ...overrides };
}

describe('filterAndRank', () => {
  it('sorts by play_count descending', () => {
    const input = [
      makeSong({ id: '1', title: 'A', playCount: 5 }),
      makeSong({ id: '2', title: 'B', playCount: 20 }),
      makeSong({ id: '3', title: 'C', playCount: 10 }),
    ];
    const out = filterAndRank(input, { sortBy: 'play_count' });
    expect(out.map((s) => s.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by upvote_count descending', () => {
    const input = [
      makeSong({ id: '1', likeCount: 1 }),
      makeSong({ id: '2', likeCount: 3 }),
      makeSong({ id: '3', likeCount: 2 }),
    ];
    const out = filterAndRank(input, { sortBy: 'upvote_count' });
    expect(out.map((s) => s.id)).toEqual(['2', '3', '1']);
  });

  it('sorts by created_at descending (newest first)', () => {
    const input = [
      makeSong({ id: '1', createdAt: '2026-01-01T00:00:00.000Z' }),
      makeSong({ id: '2', createdAt: '2026-03-01T00:00:00.000Z' }),
      makeSong({ id: '3', createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const out = filterAndRank(input, { sortBy: 'created_at' });
    expect(out.map((s) => s.id)).toEqual(['2', '3', '1']);
  });

  it('filters private songs by default', () => {
    const input = [makeSong({ id: '1' }), makeSong({ id: '2', isPublic: false })];
    const out = filterAndRank(input);
    expect(out.map((s) => s.id)).toEqual(['1']);
  });

  it('drops not-complete songs by default', () => {
    const input = [makeSong({ id: '1' }), makeSong({ id: '2', status: 'queued' })];
    const out = filterAndRank(input);
    expect(out.map((s) => s.id)).toEqual(['1']);
  });

  it('applies include_tags (substring, case-insensitive)', () => {
    const input = [
      makeSong({ id: '1', tags: ['Synthwave', 'Upbeat'] }),
      makeSong({ id: '2', tags: ['Jazz'] }),
      makeSong({ id: '3', tags: ['synth', 'chill'] }),
    ];
    const out = filterAndRank(input, { includeTags: ['synth'] });
    expect(out.map((s) => s.id).sort()).toEqual(['1', '3']);
  });

  it('applies exclude_tags', () => {
    const input = [
      makeSong({ id: '1', tags: ['Instrumental'] }),
      makeSong({ id: '2', tags: ['Vocal'] }),
    ];
    const out = filterAndRank(input, { excludeTags: ['Instrumental'] });
    expect(out.map((s) => s.id)).toEqual(['2']);
  });

  it('applies duration floor/ceiling', () => {
    const input = [
      makeSong({ id: '1', durationSeconds: 30 }),
      makeSong({ id: '2', durationSeconds: 120 }),
      makeSong({ id: '3', durationSeconds: 400 }),
    ];
    const out = filterAndRank(input, { minDurationSeconds: 60, maxDurationSeconds: 300 });
    expect(out.map((s) => s.id)).toEqual(['2']);
  });

  it('applies minPlays', () => {
    const input = [makeSong({ id: '1', playCount: 3 }), makeSong({ id: '2', playCount: 30 })];
    const out = filterAndRank(input, { minPlays: 10 });
    expect(out.map((s) => s.id)).toEqual(['2']);
  });

  it('lifts pinned songs above the sorted rest', () => {
    const input = [
      makeSong({ id: '1', playCount: 100 }),
      makeSong({ id: '2', playCount: 50, isPinned: true }),
      makeSong({ id: '3', playCount: 80 }),
    ];
    const out = filterAndRank(input, { sortBy: 'play_count', pinnedFirst: true });
    expect(out.map((s) => s.id)).toEqual(['2', '1', '3']);
  });

  it('lifts featured UUIDs above pinned', () => {
    const input = [
      makeSong({ id: '1', playCount: 100 }),
      makeSong({ id: '2', playCount: 50, isPinned: true }),
      makeSong({ id: '3', playCount: 80 }),
    ];
    const out = filterAndRank(input, {
      sortBy: 'play_count',
      pinnedFirst: true,
      featured: ['3'],
    });
    // After sort: [1,3,2] (play_count desc); featured: [3, 1, 2]; pinnedFirst: [2, 3, 1]
    expect(out.map((s) => s.id)).toEqual(['2', '3', '1']);
  });

  it('caps results to `max`', () => {
    const input = Array.from({ length: 10 }, (_, i) => makeSong({ id: `${i}`, playCount: i }));
    const out = filterAndRank(input, { sortBy: 'play_count', max: 3 });
    expect(out).toHaveLength(3);
    expect(out.map((s) => s.id)).toEqual(['9', '8', '7']);
  });

  it('drops explicit when allowExplicit=false', () => {
    const input = [makeSong({ id: '1', explicit: true }), makeSong({ id: '2', explicit: false })];
    const out = filterAndRank(input, { allowExplicit: false });
    expect(out.map((s) => s.id)).toEqual(['2']);
  });
});
