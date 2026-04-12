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
