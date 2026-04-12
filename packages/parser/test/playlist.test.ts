import { describe, expect, it } from 'vitest';
import { SunoNotFoundError } from '../src/errors.js';
import { fetchPlaylist } from '../src/playlist.js';
import { fetchTrending } from '../src/trending.js';
import { loadFixture, mockFetchJson } from './_helpers.js';

const PLAYLIST_ID = '0e89c244-c1fe-4c92-bd57-d14633a96b60';
const PLAYLIST_URL = `https://studio-api-prod.suno.com/api/playlist/${PLAYLIST_ID}`;
const TRENDING_URL = 'https://studio-api-prod.suno.com/api/trending';

describe('fetchPlaylist', () => {
  it('returns a normalized SunoPlaylistDetail from the real fixture', async () => {
    const body = loadFixture('playlist-detail.json');
    const pl = await fetchPlaylist(PLAYLIST_ID, {
      fetchImpl: mockFetchJson(PLAYLIST_URL, 200, body),
    });

    expect(pl.id).toBe(PLAYLIST_ID);
    expect(pl.name).toBe("Chan's Creation");
    expect(pl.numTotalTracks).toBe(55);
    expect(pl.currentPage).toBe(1);
    expect(pl.isDiscover).toBe(false);
    expect(pl.owner?.handle).toBe('chanmeng');
    expect(pl.owner?.displayName).toBe('Chan');
    expect(pl.clips.length).toBeGreaterThan(0);
    // Every mapped clip must carry the playlist source.
    for (const c of pl.clips) expect(c.source).toBe('playlist');
    expect(pl.source).toBe('playlist');
    expect(pl.shareUrl).toContain(PLAYLIST_ID);
  });

  it('forwards 404 as SunoNotFoundError', async () => {
    await expect(
      fetchPlaylist(PLAYLIST_ID, {
        fetchImpl: mockFetchJson(PLAYLIST_URL, 404, { error: 'not found' }),
      }),
    ).rejects.toBeInstanceOf(SunoNotFoundError);
  });

  it('appends ?page= when opts.page is set', async () => {
    const body = loadFixture('playlist-detail.json');
    let calledUrl = '';
    const pl = await fetchPlaylist(PLAYLIST_ID, {
      page: 2,
      fetchImpl: async (url) => {
        calledUrl = typeof url === 'string' ? url : url.toString();
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    });
    expect(calledUrl).toBe(`${PLAYLIST_URL}?page=2`);
    expect(pl.name).toBe("Chan's Creation");
  });
});

describe('fetchTrending', () => {
  it('returns the Explore editorial playlist with source=trending', async () => {
    const body = loadFixture('trending.json');
    const pl = await fetchTrending({
      fetchImpl: mockFetchJson(TRENDING_URL, 200, body),
    });

    expect(pl.id).toBeTruthy();
    expect(pl.name).toBe('Explore');
    expect(pl.isDiscover).toBe(false); // server sets is_discover_playlist=false for Explore
    expect(pl.owner).toBeNull(); // trending has no user_handle
    expect(pl.source).toBe('trending');
    expect(pl.numTotalTracks).toBeGreaterThan(0);
    expect(pl.clips.length).toBeGreaterThan(0);
    for (const c of pl.clips) expect(c.source).toBe('trending');
  });
});
