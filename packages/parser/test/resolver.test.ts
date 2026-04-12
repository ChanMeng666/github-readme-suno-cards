import { describe, expect, it } from 'vitest';
import { SunoInvalidInputError } from '../src/errors.js';
import { _clearShortCodeCache, resolveShortCode } from '../src/resolver.js';

const UUID = 'a885e43c-6918-456f-a5f0-0e8e29e61066';

function mockRedirect(status: number, location: string | null) {
  return async (_url: string | URL | Request, _init?: RequestInit) => {
    const headers = new Headers();
    if (location) headers.set('location', location);
    return new Response(null, { status, headers });
  };
}

describe('resolveShortCode', () => {
  it('extracts UUID from the Location header of a 307 redirect', async () => {
    _clearShortCodeCache();
    const result = await resolveShortCode('Fgjo6R52kPsRs16o', {
      fetchImpl: mockRedirect(307, `/song/${UUID}?sh=Fgjo6R52kPsRs16o`),
    });
    expect(result).toBe(UUID);
  });

  it('caches the resolved UUID (second call does not re-fetch)', async () => {
    _clearShortCodeCache();
    let calls = 0;
    const fetchImpl = async (_url: string | URL | Request, _init?: RequestInit) => {
      calls++;
      const headers = new Headers();
      headers.set('location', `/song/${UUID}`);
      return new Response(null, { status: 307, headers });
    };
    await resolveShortCode('Abc123Def456', { fetchImpl });
    await resolveShortCode('Abc123Def456', { fetchImpl });
    expect(calls).toBe(1);
  });

  it('throws on 404', async () => {
    _clearShortCodeCache();
    await expect(
      resolveShortCode('zzz', { fetchImpl: mockRedirect(404, null) }),
    ).rejects.toBeInstanceOf(SunoInvalidInputError);
  });

  it('throws when Location header is missing', async () => {
    _clearShortCodeCache();
    await expect(
      resolveShortCode('zzz', { fetchImpl: mockRedirect(307, null) }),
    ).rejects.toBeInstanceOf(SunoInvalidInputError);
  });

  it('throws when Location has no UUID', async () => {
    _clearShortCodeCache();
    await expect(
      resolveShortCode('zzz', { fetchImpl: mockRedirect(307, '/some/other/path') }),
    ).rejects.toBeInstanceOf(SunoInvalidInputError);
  });
});
