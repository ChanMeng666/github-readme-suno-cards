import { describe, expect, it } from 'vitest';
import { SunoInvalidInputError } from '../src/errors.js';
import { normalizeInput } from '../src/normalize.js';

describe('normalizeInput', () => {
  const UUID = 'a885e43c-6918-456f-a5f0-0e8e29e61066';

  it('accepts a bare UUID', () => {
    expect(normalizeInput(UUID)).toEqual({ kind: 'uuid', uuid: UUID });
  });

  it('lowercases an uppercase UUID', () => {
    expect(normalizeInput(UUID.toUpperCase())).toEqual({ kind: 'uuid', uuid: UUID });
  });

  it('extracts UUID from /song/ URL', () => {
    expect(normalizeInput(`https://suno.com/song/${UUID}`)).toEqual({ kind: 'uuid', uuid: UUID });
  });

  it('extracts UUID from /song/ URL with query string', () => {
    expect(normalizeInput(`https://suno.com/song/${UUID}?sh=abc`)).toEqual({
      kind: 'uuid',
      uuid: UUID,
    });
  });

  it('extracts UUID from /embed/ URL', () => {
    expect(normalizeInput(`https://suno.com/embed/${UUID}`)).toEqual({ kind: 'uuid', uuid: UUID });
  });

  it('extracts short code from /s/ URL', () => {
    expect(normalizeInput('https://suno.com/s/Fgjo6R52kPsRs16o')).toEqual({
      kind: 'shortCode',
      shortCode: 'Fgjo6R52kPsRs16o',
    });
  });

  it('recognizes a bare short code (mixed case)', () => {
    expect(normalizeInput('Fgjo6R52kPsRs16o')).toEqual({
      kind: 'shortCode',
      shortCode: 'Fgjo6R52kPsRs16o',
    });
  });

  it('recognizes @handle', () => {
    expect(normalizeInput('@chanmeng')).toEqual({ kind: 'handle', handle: 'chanmeng' });
  });

  it('recognizes bare handle', () => {
    expect(normalizeInput('chanmeng')).toEqual({ kind: 'handle', handle: 'chanmeng' });
  });

  it('recognizes /@ handle URL', () => {
    expect(normalizeInput('https://suno.com/@chanmeng')).toEqual({
      kind: 'handle',
      handle: 'chanmeng',
    });
  });

  it('recognizes /playlist/{uuid} URL as playlistUuid (round-3 finding)', () => {
    const PLAYLIST_ID = '0e89c244-c1fe-4c92-bd57-d14633a96b60';
    expect(normalizeInput(`https://suno.com/playlist/${PLAYLIST_ID}`)).toEqual({
      kind: 'playlistUuid',
      uuid: PLAYLIST_ID,
    });
  });

  it('recognizes /playlist/{uuid} URL with a query string', () => {
    const PLAYLIST_ID = '0e89c244-c1fe-4c92-bd57-d14633a96b60';
    expect(normalizeInput(`https://suno.com/playlist/${PLAYLIST_ID}?page=2`)).toEqual({
      kind: 'playlistUuid',
      uuid: PLAYLIST_ID,
    });
  });

  it('recognizes the stable trending playlist UUID via /playlist/ URL', () => {
    // The stable UUID for /api/trending.
    const TRENDING_ID = '1190bf92-10dc-4ce5-968a-7a377f37f984';
    expect(normalizeInput(`https://suno.com/playlist/${TRENDING_ID}`)).toEqual({
      kind: 'playlistUuid',
      uuid: TRENDING_ID,
    });
  });

  it('throws on empty input', () => {
    expect(() => normalizeInput('')).toThrow(SunoInvalidInputError);
  });

  it('throws on garbage', () => {
    expect(() => normalizeInput('!!!!')).toThrow(SunoInvalidInputError);
  });

  it('throws on non-suno.com URL', () => {
    expect(() => normalizeInput('https://example.com/foo')).toThrow(SunoInvalidInputError);
  });
});
