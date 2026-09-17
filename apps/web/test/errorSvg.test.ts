import {
  SunoHandleNotFoundError,
  SunoInvalidInputError,
  SunoInvalidRequestError,
  SunoNotFoundError,
  SunoNotReadyError,
  SunoPrivateError,
  SunoSchemaError,
} from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import { classifyError, errorToSvg, svgResponse, withSkippedClips } from '../lib/errorSvg.js';

describe('classifyError', () => {
  it('maps SunoNotFoundError to not_found', () => {
    const err = new SunoNotFoundError('uuid-1');
    expect(classifyError(err).kind).toBe('not_found');
    expect(classifyError(err).detail).toBe('uuid-1');
  });
  it('maps SunoHandleNotFoundError to not_found with @handle', () => {
    const err = new SunoHandleNotFoundError('nobody');
    expect(classifyError(err).kind).toBe('not_found');
    expect(classifyError(err).detail).toBe('@nobody');
  });
  it('maps SunoPrivateError to private', () => {
    expect(classifyError(new SunoPrivateError('x')).kind).toBe('private');
  });
  it('maps SunoNotReadyError to not_ready', () => {
    expect(classifyError(new SunoNotReadyError('x', 'queued')).kind).toBe('not_ready');
  });
  it('maps SunoInvalidInputError to not_found', () => {
    expect(classifyError(new SunoInvalidInputError('???')).kind).toBe('not_found');
  });
  it('maps SunoInvalidRequestError (422) to generic error, not not_found', () => {
    const err = new SunoInvalidRequestError('https://studio-api-prod.suno.com/api/profiles/x', 422);
    expect(classifyError(err).kind).toBe('error');
  });
  it('maps SunoSchemaError to the endpoint path plus the first issue path, no query', () => {
    const err = new SunoSchemaError(
      'https://studio-api-prod.suno.com/api/profiles/chanmeng?clips_sort_by=created_at&page=1',
      [
        {
          message: 'Invalid type',
          path: [
            { key: 'clips' },
            { key: 3 },
            { key: 'metadata' },
            { key: 'model_badges' },
            { key: 'songrow' },
          ],
        },
        { message: 'second', path: [{ key: 'handle' }] },
      ],
    );
    const { kind, detail } = classifyError(err);
    expect(kind).toBe('error');
    expect(detail).toBe('/api/profiles/chanmeng · clips.3.metadata.model_badges.songrow');
    expect(detail).not.toContain('?');
  });
  it('maps SunoSchemaError with no issue path (non-2xx) to the path alone', () => {
    const err = new SunoSchemaError('https://studio-api-prod.suno.com/api/clip/abc?x=1', {
      status: 500,
    });
    expect(classifyError(err).detail).toBe('/api/clip/abc');
  });
  it('maps unknown Error to generic error', () => {
    expect(classifyError(new Error('boom')).kind).toBe('error');
  });
  it('maps non-Error to generic error', () => {
    expect(classifyError('bare string').kind).toBe('error');
  });
});

describe('errorToSvg', () => {
  it('returns a complete SVG for any error', () => {
    const svg = errorToSvg(new SunoNotFoundError('x'));
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('</svg>');
    expect(svg).toContain('Song not found');
  });
  it('localizes error messages', () => {
    const svg = errorToSvg(new SunoNotFoundError('x'), { lang: 'zh' });
    expect(svg).toContain('歌曲未找到');
  });
});

describe('withSkippedClips', () => {
  it('adds x-suno-skipped-clips only when clips were dropped', () => {
    expect(withSkippedClips(svgResponse('<svg/>'), 2).headers.get('x-suno-skipped-clips')).toBe(
      '2',
    );
    expect(withSkippedClips(svgResponse('<svg/>'), 0).headers.has('x-suno-skipped-clips')).toBe(
      false,
    );
  });
});

describe('svgResponse', () => {
  it('sets correct content type and cache headers', () => {
    const res = svgResponse('<svg></svg>', 1800);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('image/svg+xml');
    expect(res.headers.get('cache-control')).toContain('s-maxage=1800');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
  });
});
