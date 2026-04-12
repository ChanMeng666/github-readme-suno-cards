import { describe, expect, it } from 'vitest';
import { normalizeManifest } from '../src/manifest.js';

describe('normalizeManifest', () => {
  it('handles the { songs: [...] } top-level shape', () => {
    const doc = {
      songs: [
        'a885e43c-6918-456f-a5f0-0e8e29e61066',
        { id: '11111111-1111-1111-1111-111111111111', featured: true },
      ],
    };
    const result = normalizeManifest(doc);
    expect(result.songs).toEqual([
      { id: 'a885e43c-6918-456f-a5f0-0e8e29e61066' },
      { id: '11111111-1111-1111-1111-111111111111', featured: true },
    ]);
  });

  it('handles a bare array of strings', () => {
    const doc = ['uuid-one', 'uuid-two'];
    expect(normalizeManifest(doc).songs).toEqual([{ id: 'uuid-one' }, { id: 'uuid-two' }]);
  });

  it('handles a bare array of objects', () => {
    const doc = [{ id: 'uuid-one' }, { id: 'uuid-two', featured: true }];
    expect(normalizeManifest(doc).songs).toEqual([
      { id: 'uuid-one' },
      { id: 'uuid-two', featured: true },
    ]);
  });

  it('trims and drops empty entries', () => {
    const doc = [' uuid-one ', '', '  '];
    expect(normalizeManifest(doc).songs).toEqual([{ id: 'uuid-one' }]);
  });

  it('returns empty songs for unknown shapes', () => {
    expect(normalizeManifest(null).songs).toEqual([]);
    expect(normalizeManifest(42).songs).toEqual([]);
    expect(normalizeManifest({}).songs).toEqual([]);
  });

  it('coerces featured flag to boolean', () => {
    const doc = [
      { id: 'a', featured: true },
      { id: 'b', featured: 'true' },
      { id: 'c', featured: 1 },
      { id: 'd', featured: 0 },
      { id: 'e' },
    ];
    const result = normalizeManifest(doc);
    expect(result.songs).toEqual([
      { id: 'a', featured: true },
      { id: 'b', featured: true },
      { id: 'c', featured: true },
      { id: 'd', featured: false },
      { id: 'e' },
    ]);
  });
});
