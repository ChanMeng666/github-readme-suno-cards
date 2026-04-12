import { describe, expect, it } from 'vitest';
import { SunoHandleNotFoundError } from '../src/errors.js';
import { fetchProfile, fetchProfilePage } from '../src/profile.js';
import { loadFixture, mockFetchJson } from './_helpers.js';

describe('fetchProfilePage', () => {
  it('returns normalized profile + clips from real page 1', async () => {
    const body = loadFixture('profile-page1.json');
    const result = await fetchProfilePage('chanmeng', {
      fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, body),
    });

    expect(result.profile.handle).toBe('chanmeng');
    expect(result.profile.displayName).toBe('Chan');
    expect(result.profile.totalClips).toBe(26);
    expect(result.profile.stats.totalPlays).toBe(736);
    expect(result.profile.stats.totalLikes).toBe(55);
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

  it('maps 422 (bad handle) to SunoHandleNotFoundError', async () => {
    await expect(
      fetchProfilePage('!!!', {
        fetchImpl: mockFetchJson(/api\/profiles/, 422, { detail: 'bad handle' }),
      }),
    ).rejects.toBeInstanceOf(SunoHandleNotFoundError);
  });
});

describe('fetchProfile', () => {
  it('returns summary only, ignoring clips', async () => {
    const body = loadFixture('profile-page1.json');
    const profile = await fetchProfile('chanmeng', {
      fetchImpl: mockFetchJson(/api\/profiles\/chanmeng/, 200, body),
    });
    expect(profile.totalClips).toBe(26);
    expect(profile.stats.totalPlays).toBe(736);
  });
});
