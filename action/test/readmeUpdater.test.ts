import { describe, expect, it } from 'vitest';
import { MarkersNotFoundError, updateReadmeContent } from '../src/readmeUpdater.js';

describe('updateReadmeContent', () => {
  const block = '![card](https://example.com/card.svg)';

  it('replaces content between markers', () => {
    const source = `# My README

<!-- SUNO-CARDS:START -->
old content here
<!-- SUNO-CARDS:END -->

more text`;
    const out = updateReadmeContent(source, 'SUNO-CARDS', block);
    expect(out).toContain('<!-- SUNO-CARDS:START -->');
    expect(out).toContain(block);
    expect(out).toContain('<!-- SUNO-CARDS:END -->');
    expect(out).not.toContain('old content here');
    expect(out).toContain('# My README');
    expect(out).toContain('more text');
  });

  it('inserts into empty markers', () => {
    const source = '<!-- SUNO-CARDS:START --><!-- SUNO-CARDS:END -->';
    const out = updateReadmeContent(source, 'SUNO-CARDS', block);
    expect(out).toContain(block);
  });

  it('supports custom marker names', () => {
    const source = '<!-- LATEST-SUNO:START -->\n<!-- LATEST-SUNO:END -->';
    const out = updateReadmeContent(source, 'LATEST-SUNO', block);
    expect(out).toContain(block);
  });

  it('throws when markers are missing', () => {
    expect(() => updateReadmeContent('# no markers', 'SUNO-CARDS', block)).toThrow(
      MarkersNotFoundError,
    );
  });

  it('is idempotent on repeat runs with same content', () => {
    const source = `<!-- SUNO-CARDS:START -->\n${block}\n<!-- SUNO-CARDS:END -->`;
    const first = updateReadmeContent(source, 'SUNO-CARDS', block);
    const second = updateReadmeContent(first, 'SUNO-CARDS', block);
    expect(first).toBe(second);
  });

  it('tolerates extra whitespace in marker tags', () => {
    const source = '<!--   SUNO-CARDS:START   -->\n<!--  SUNO-CARDS:END  -->';
    const out = updateReadmeContent(source, 'SUNO-CARDS', block);
    expect(out).toContain(block);
  });
});
