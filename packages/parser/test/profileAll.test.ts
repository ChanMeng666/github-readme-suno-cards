import { describe, expect, it } from 'vitest';
import { fetchAllClips } from '../src/profileAll.js';
import { loadFixture, mockFetchMap } from './_helpers.js';

describe('fetchAllClips', () => {
  it('paginates across real fixtures until num_total_clips is reached', async () => {
    const page1 = loadFixture('profile-page1.json');
    const page2 = loadFixture('profile-page2.json');

    let page1Calls = 0;
    let page2Calls = 0;
    const fetchImpl = async (url: string | URL | Request, _init?: RequestInit) => {
      const s = typeof url === 'string' ? url : url.toString();
      if (s.includes('page=1')) {
        page1Calls++;
        return new Response(JSON.stringify(page1), { status: 200 });
      }
      if (s.includes('page=2')) {
        page2Calls++;
        return new Response(JSON.stringify(page2), { status: 200 });
      }
      throw new Error(`unexpected url ${s}`);
    };

    const result = await fetchAllClips('chanmeng', { fetchImpl });

    expect(page1Calls).toBe(1);
    expect(page2Calls).toBe(1);
    expect(result.profile.totalClips).toBe(26);
    expect(result.clips.length).toBe(26);
  });

  it('stops early when maxClips is reached', async () => {
    const page1 = loadFixture('profile-page1.json');
    let calls = 0;
    const fetchImpl = async (_url: string | URL | Request) => {
      calls++;
      return new Response(JSON.stringify(page1), { status: 200 });
    };
    const result = await fetchAllClips('chanmeng', { fetchImpl, maxClips: 5 });
    expect(calls).toBe(1);
    expect(result.clips).toHaveLength(5);
  });

  it('respects maxPagesToFetch safety valve', async () => {
    const page1 = loadFixture('profile-page1.json');
    // Simulate a profile where every page returns 20 but total is huge:
    // we force early exit via maxPagesToFetch.
    const hugePage = { ...(page1 as Record<string, unknown>), num_total_clips: 999 };
    let calls = 0;
    const fetchImpl = async (_url: string | URL | Request) => {
      calls++;
      return new Response(JSON.stringify(hugePage), { status: 200 });
    };
    const result = await fetchAllClips('chanmeng', { fetchImpl, maxPagesToFetch: 3 });
    expect(calls).toBe(3);
    expect(result.clips.length).toBe(60);
  });
});
