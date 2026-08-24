import { describe, expect, it } from 'vitest';
import { fetchAsDataUri } from '../lib/image.js';

function mockFetchBytes(contentType: string, bytes: Uint8Array, status = 200): typeof fetch {
  return async () => {
    // Clone into a new ArrayBuffer so arrayBuffer() returns a standalone ArrayBuffer
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);
    return new Response(ab, { status, headers: { 'content-type': contentType } });
  };
}

describe('fetchAsDataUri', () => {
  it('returns null for null/undefined/empty input', async () => {
    expect(await fetchAsDataUri(null)).toBeNull();
    expect(await fetchAsDataUri(undefined)).toBeNull();
    expect(await fetchAsDataUri('')).toBeNull();
  });

  it('encodes bytes as base64 data URI with the upstream content type', async () => {
    // 5 bytes: "Hello" → "SGVsbG8="
    const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    const result = await fetchAsDataUri('https://example.com/x.png', {
      fetchImpl: mockFetchBytes('image/png', bytes),
    });
    expect(result).toBe('data:image/png;base64,SGVsbG8=');
  });

  it('returns null on non-2xx status', async () => {
    const result = await fetchAsDataUri('https://example.com/x.jpg', {
      fetchImpl: mockFetchBytes('image/jpeg', new Uint8Array([1, 2, 3]), 404),
    });
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    const fetchImpl: typeof fetch = async () => {
      throw new Error('boom');
    };
    const result = await fetchAsDataUri('https://example.com/x.jpg', { fetchImpl });
    expect(result).toBeNull();
  });

  it('falls back to image/jpeg when content-type is missing', async () => {
    const fetchImpl: typeof fetch = async () => {
      return new Response(new Uint8Array([0x41]).buffer, { status: 200 });
    };
    const result = await fetchAsDataUri('https://example.com/x', { fetchImpl });
    expect(result).toMatch(/^data:image\/jpeg;base64,/);
  });
});

describe('fetchAsDataUri — renderWidth', () => {
  const COVER = 'https://cdn2.suno.ai/image_a885e43c-6918-456f-a5f0-0e8e29e61066.jpeg';

  function spyFetch() {
    const seen: string[] = [];
    const fetchImpl = (async (url: string | URL | Request) => {
      seen.push(typeof url === 'string' ? url : url.toString());
      return new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'content-type': 'image/jpeg' },
      });
    }) as unknown as typeof fetch;
    return { seen, fetchImpl };
  }

  it('asks Suno for a card-sized cover instead of the original', async () => {
    const { seen, fetchImpl } = spyFetch();
    // 120 logical px at 2x = 240, which snaps UP to the allowed 256. Requesting
    // 240 directly would be a 403, not a smaller image.
    await fetchAsDataUri(COVER, { fetchImpl, renderWidth: 120 });
    expect(seen).toEqual([`${COVER}?width=256`]);
  });

  it('leaves the URL alone when no renderWidth is given', async () => {
    const { seen, fetchImpl } = spyFetch();
    await fetchAsDataUri(COVER, { fetchImpl });
    expect(seen).toEqual([COVER]);
  });

  it('does not rewrite non-Suno asset hosts', async () => {
    const { seen, fetchImpl } = spyFetch();
    const foreign = 'https://example.com/avatar.png';
    await fetchAsDataUri(foreign, { fetchImpl, renderWidth: 60 });
    expect(seen).toEqual([foreign]);
  });
});
