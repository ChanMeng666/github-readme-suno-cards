import { describe, expect, it } from 'vitest';
import { SunoInvalidInputError, fetchAllClips, fetchSong } from '../src/index.js';
import { loadFixture, mockFetchMap } from './_helpers.js';

const UUID = 'a885e43c-6918-456f-a5f0-0e8e29e61066';

describe('fetchSong (integration)', () => {
  it('resolves a bare UUID through the clip endpoint', async () => {
    const clip = loadFixture('clip-complete.json');
    const fetchImpl = mockFetchMap({
      [`https://studio-api-prod.suno.com/api/clip/${UUID}`]: { status: 200, body: clip },
    });
    const song = await fetchSong(UUID, { fetchImpl });
    expect(song.id).toBe(UUID);
    expect(song.title).toBe('冷酷史官的注脚');
    expect(song.source).toBe('clip');
  });

  it('resolves a /song/ URL', async () => {
    const clip = loadFixture('clip-complete.json');
    const fetchImpl = mockFetchMap({
      [`https://studio-api-prod.suno.com/api/clip/${UUID}`]: { status: 200, body: clip },
    });
    const song = await fetchSong(`https://suno.com/song/${UUID}`, { fetchImpl });
    expect(song.id).toBe(UUID);
  });

  it('rejects a handle input', async () => {
    await expect(fetchSong('chanmeng')).rejects.toBeInstanceOf(SunoInvalidInputError);
  });

  it('degrades to oEmbed on schema failure at /api/clip/', async () => {
    const oembed = loadFixture('oembed-complete.json');
    const fetchImpl = mockFetchMap({
      [`https://studio-api-prod.suno.com/api/clip/${UUID}`]: {
        status: 200,
        body: { garbage: true },
      },
      // oEmbed URL has a query string — mockFetchMap prefix-matches
      'https://studio-api-prod.suno.com/api/oembed': { status: 200, body: oembed },
    });
    const song = await fetchSong(UUID, { fetchImpl });
    expect(song.source).toBe('oembed');
    expect(song.title).toBeTruthy();
  });
});

describe('fetchAllClips (integration)', () => {
  it('paginates, filters, and ranks real fixtures', async () => {
    const page1 = loadFixture('profile-page1.json');
    const page2 = loadFixture('profile-page2.json');
    const fetchImpl = async (url: string | URL | Request) => {
      const s = typeof url === 'string' ? url : url.toString();
      if (s.includes('page=1')) return new Response(JSON.stringify(page1), { status: 200 });
      if (s.includes('page=2')) return new Response(JSON.stringify(page2), { status: 200 });
      throw new Error(`unexpected ${s}`);
    };

    const result = await fetchAllClips('chanmeng', {
      fetchImpl,
      sortBy: 'play_count',
      max: 5,
    });

    expect(result.profile.handle).toBe('chanmeng');
    expect(result.clips).toHaveLength(5);
    // Top 5 by play_count should be monotonically non-increasing
    for (let i = 1; i < result.clips.length; i++) {
      expect(result.clips[i]!.playCount).toBeLessThanOrEqual(result.clips[i - 1]!.playCount);
    }
    // The top song in chanmeng's library by play count is "无字书" with 71 plays
    expect(result.clips[0]?.title).toBe('无字书');
    expect(result.clips[0]?.playCount).toBe(71);
  });
});
