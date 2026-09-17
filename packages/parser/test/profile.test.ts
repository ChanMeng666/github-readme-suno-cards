import { describe, expect, it } from 'vitest';
import {
  SunoHandleNotFoundError,
  SunoInvalidRequestError,
  SunoSchemaError,
  formatIssuePath,
} from '../src/errors.js';
import { fetchProfile, fetchProfilePage } from '../src/profile.js';
import { loadFixture, mockFetchJson } from './_helpers.js';

describe('fetchProfilePage', () => {
  it('returns normalized profile + clips from real page 1', async () => {
    const body = loadFixture<{
      num_total_clips: number;
      stats: { play_count__sum: number; upvote_count__sum: number };
    }>('profile-page1.json');
    const result = await fetchProfilePage('chanmeng', {
      fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, body),
    });

    expect(result.profile.handle).toBe('chanmeng');
    expect(result.profile.displayName).toBe('Chan');
    // Live counters — assert the mapping against the fixture, not a pinned
    // number (they tick between fixture refreshes).
    expect(result.profile.totalClips).toBe(body.num_total_clips);
    expect(result.profile.stats.totalPlays).toBe(body.stats.play_count__sum);
    expect(result.profile.stats.totalLikes).toBe(body.stats.upvote_count__sum);
    expect(result.profile.shareUrl).toBe('https://suno.com/@chanmeng');
    expect(result.clips).toHaveLength(20);
    expect(result.clips[0]?.source).toBe('profile');
    expect(result.profile.playlists).toHaveLength(1);
  });

  it('maps 404 to SunoHandleNotFoundError', async () => {
    await expect(
      fetchProfilePage('nobody', {
        fetchImpl: mockFetchJson(/api\/profiles\/nobody/, 404, { error: 'not found' }),
      }),
    ).rejects.toBeInstanceOf(SunoHandleNotFoundError);
  });

  it('maps 422 (malformed request) to SunoInvalidRequestError, not handle-not-found', async () => {
    await expect(
      fetchProfilePage('somebody', {
        fetchImpl: mockFetchJson(/api\/profiles/, 422, { detail: 'missing sort params' }),
      }),
    ).rejects.toBeInstanceOf(SunoInvalidRequestError);
    // A 422 must NOT be conflated with a genuinely missing handle (404).
    await expect(
      fetchProfilePage('somebody', {
        fetchImpl: mockFetchJson(/api\/profiles/, 422, { detail: 'missing sort params' }),
      }),
    ).rejects.not.toBeInstanceOf(SunoHandleNotFoundError);
  });
});

// One clip in a shape Suno has just changed must cost that clip, not the page.
// This is the failure that put an error card on every profile in September 2026.
describe('fetchProfilePage — per-clip validation', () => {
  type Page = { clips: Array<Record<string, unknown>> };

  it('keeps the valid clips and counts the one that fails', async () => {
    const body = loadFixture<Page>('profile-page1.json');
    const clips = body.clips.map((c) => ({ ...c }));
    const total = clips.length;
    clips[3] = { ...clips[3], play_count: 'lots' };
    const result = await fetchProfilePage('chanmeng', {
      fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, { ...body, clips }),
    });

    expect(result.clips).toHaveLength(total - 1);
    expect(result.skippedClips).toBe(1);
    expect(result.skippedIssues).toEqual(['clips.3.play_count']);
  });

  it('reports zero skipped clips for a clean page', async () => {
    const body = loadFixture('profile-page1.json');
    const result = await fetchProfilePage('chanmeng', {
      fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, body),
    });
    expect(result.skippedClips).toBe(0);
    expect(result.skippedIssues).toEqual([]);
  });

  it('still throws SunoSchemaError when every clip fails', async () => {
    const body = loadFixture<Page>('profile-page1.json');
    const clips = body.clips.map((c) => ({ ...c, id: 'not-a-uuid' }));
    const err: unknown = await fetchProfilePage('chanmeng', {
      fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, { ...body, clips }),
    }).catch((e: unknown) => e);

    expect(err).toBeInstanceOf(SunoSchemaError);
    const issues = (err as SunoSchemaError).issues as unknown[];
    expect(formatIssuePath(issues[0])).toBe('clips.0.id');
  });

  it('still throws SunoSchemaError when the envelope itself fails', async () => {
    const body = loadFixture<Page>('profile-page1.json');
    await expect(
      fetchProfilePage('chanmeng', {
        fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, { ...body, handle: 42 }),
      }),
    ).rejects.toBeInstanceOf(SunoSchemaError);
  });

  it('does not throw for an empty clip list', async () => {
    const body = loadFixture<Page>('profile-page1.json');
    const result = await fetchProfilePage('chanmeng', {
      fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, { ...body, clips: [] }),
    });
    expect(result.clips).toEqual([]);
    expect(result.skippedClips).toBe(0);
  });
});

describe('fetchProfile', () => {
  it('returns summary only, ignoring clips', async () => {
    const body = loadFixture<{
      num_total_clips: number;
      stats: { play_count__sum: number };
    }>('profile-page1.json');
    const profile = await fetchProfile('chanmeng', {
      fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, body),
    });
    expect(profile.totalClips).toBe(body.num_total_clips);
    expect(profile.stats.totalPlays).toBe(body.stats.play_count__sum);
  });
});
