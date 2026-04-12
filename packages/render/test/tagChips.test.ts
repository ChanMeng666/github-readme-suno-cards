import type { ClassifiedTags } from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import { renderTagChipsHtml, selectChips } from '../src/tagChips.js';

const makeTags = (overrides: Partial<ClassifiedTags> = {}): ClassifiedTags => ({
  genre: [],
  era: [],
  instrument: [],
  mood: [],
  vocal: [],
  key: [],
  production: [],
  tempo: [],
  other: [],
  ...overrides,
});

describe('selectChips', () => {
  it('drains buckets in priority order', () => {
    const tags = makeTags({
      genre: ['Synthwave'],
      mood: ['Chill'],
      vocal: ['Female Vocal'],
      instrument: ['Piano'],
    });
    expect(selectChips(tags, { max: 10 })).toEqual(['Synthwave', 'Chill', 'Female Vocal', 'Piano']);
  });
  it('caps to max', () => {
    const tags = makeTags({ genre: ['A', 'B', 'C'], mood: ['D'] });
    expect(selectChips(tags, { max: 2 })).toEqual(['A', 'B']);
  });
  it('returns empty for empty input', () => {
    expect(selectChips(makeTags())).toEqual([]);
  });
});

describe('renderTagChipsHtml', () => {
  it('emits HTML spans with proper class', () => {
    const tags = makeTags({ genre: ['Synthwave'] });
    const html = renderTagChipsHtml(tags);
    expect(html).toContain('<div class="chips">');
    expect(html).toContain('<span class="chip">Synthwave</span>');
  });
  it('escapes dangerous content', () => {
    const tags = makeTags({ other: ['<script>alert(1)</script>'] });
    const html = renderTagChipsHtml(tags);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
  it('returns empty string when no chips', () => {
    expect(renderTagChipsHtml(makeTags())).toBe('');
  });
});
