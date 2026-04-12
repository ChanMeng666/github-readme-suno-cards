import { describe, expect, it } from 'vitest';
import { escapeXml } from '../src/escape.js';

describe('escapeXml', () => {
  it('escapes the five XML entities', () => {
    expect(escapeXml('a<b')).toBe('a&lt;b');
    expect(escapeXml('a>b')).toBe('a&gt;b');
    expect(escapeXml('a&b')).toBe('a&amp;b');
    expect(escapeXml('a"b')).toBe('a&quot;b');
    expect(escapeXml("a'b")).toBe('a&apos;b');
  });
  it('passes CJK through unchanged', () => {
    expect(escapeXml('冷酷史官的注脚')).toBe('冷酷史官的注脚');
    expect(escapeXml('たった今')).toBe('たった今');
  });
  it('handles empty string', () => {
    expect(escapeXml('')).toBe('');
  });
  it('handles combined dangerous input', () => {
    expect(escapeXml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    );
  });
});
