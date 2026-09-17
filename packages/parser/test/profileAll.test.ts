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
    // Derived from the fixtures — `num_total_clips` is a live counter.
    const expectedTotal = (page1 as { num_total_clips: number }).num_total_clips;
    expect(result.profile.totalClips).toBe(expectedTotal);
    expect(result.clips.length).toBe(expectedTotal);
  });

  it('aggregates skipped clips across pages without fetching past the end', async () => {
    type Page = { clips: Array<Record<string, unknown>>; num_total_clips: number };
    const page1 = loadFixture<Page>('profile-page1.json');
    const page2 = loadFixture<Page>('profile-page2.json');
    const bad = (p: Page, i: number): Page => ({
      ...p,
      clips: p.clips.map((c, j) => (j === i ? { ...c, play_count: null } : c)),
    });
    const calls: string[] = [];
    const fetchImpl = async (url: string | URL | Request) => {
      const s = typeof url === 'string' ? url : url.toString();
      calls.push(s);
      if (s.includes('page=1')) return new Response(JSON.stringify(bad(page1, 0)), { status: 200 });
      if (s.includes('page=2')) return new Response(JSON.stringify(bad(page2, 1)), { status: 200 });
      throw new Error(`unexpected url ${s}`);
    };

    const result = await fetchAllClips('chanmeng', { fetchImpl });
    expect(calls).toHaveLength(2);
    expect(result.skippedClips).toBe(2);
    expect(result.skippedIssues).toEqual(['clips.0.play_count', 'clips.1.play_count']);
    expect(result.clips.length).toBe(page1.num_total_clips - 2);
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
