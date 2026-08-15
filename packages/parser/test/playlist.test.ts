import { describe, expect, it } from 'vitest';
import { SunoInvalidRequestError, SunoNotFoundError } from '../src/errors.js';
import { fetchPlaylist } from '../src/playlist.js';
import { loadFixture, mockFetchJson } from './_helpers.js';

const PLAYLIST_ID = '0e89c244-c1fe-4c92-bd57-d14633a96b60';
const PLAYLIST_URL = `https://studio-api-prod.suno.com/api/playlist/${PLAYLIST_ID}`;

describe('fetchPlaylist', () => {
  it('returns a normalized SunoPlaylistDetail from the real fixture', async () => {
    const body = loadFixture<{ num_total_results: number }>('playlist-detail.json');
    const pl = await fetchPlaylist(PLAYLIST_ID, {
      fetchImpl: mockFetchJson(PLAYLIST_URL, 200, body),
    });

    expect(pl.id).toBe(PLAYLIST_ID);
    expect(pl.name).toBe("Chan's Creation");
    // Live counter — derived from the fixture, not pinned.
    expect(pl.numTotalTracks).toBe(body.num_total_results);
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

  // 422 is Suno rejecting the request shape (bad/missing query params). It used
  // to be mapped to SunoHandleNotFoundError here, which told callers "no such
  // playlist" for what is really a malformed request.
  it('forwards 422 as SunoInvalidRequestError, not a not-found error', async () => {
    await expect(
      fetchPlaylist(PLAYLIST_ID, {
        fetchImpl: mockFetchJson(PLAYLIST_URL, 422, { detail: 'unprocessable' }),
      }),
    ).rejects.toBeInstanceOf(SunoInvalidRequestError);

    const err: unknown = await fetchPlaylist(PLAYLIST_ID, {
      fetchImpl: mockFetchJson(PLAYLIST_URL, 422, { detail: 'unprocessable' }),
    }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(SunoInvalidRequestError);
    expect((err as SunoInvalidRequestError).status).toBe(422);
    expect((err as SunoInvalidRequestError).endpoint).toBe(PLAYLIST_URL);
    expect(err).not.toBeInstanceOf(SunoNotFoundError);
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
