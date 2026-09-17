import { describe, expect, it } from 'vitest';
import { renderErrorCard } from '../src/errorCard.js';

describe('renderErrorCard', () => {
  it('renders the not_found variant in English', () => {
    const svg = renderErrorCard('not_found');
    expect(svg).toContain('<g class="error-card"');
    expect(svg).toContain('Song not found');
    expect(svg).toContain('🔍');
  });
  it('renders the private variant', () => {
    const svg = renderErrorCard('private');
    expect(svg).toContain('🔒');
    expect(svg).toContain('Song is private');
  });
  it('renders the not_ready variant', () => {
    const svg = renderErrorCard('not_ready');
    expect(svg).toContain('⏳');
  });
  it('localizes to Chinese', () => {
    const svg = renderErrorCard('not_found', { lang: 'zh' });
    expect(svg).toContain('歌曲未找到');
  });
  it('renders optional detail line', () => {
    const svg = renderErrorCard('error', { detail: 'backend unreachable' });
    expect(svg).toContain('backend unreachable');
  });
  // A fixed 320×60 box cut long details (an endpoint URL) off mid-word.
  it('sizes the text box to the card, less padding', () => {
    const svg = renderErrorCard('error', { width: 480, height: 140, detail: 'x' });
    expect(svg).toContain('<foreignObject x="24" y="14" width="432" height="112">');
    const wide = renderErrorCard('error', { width: 800, height: 240 });
    expect(wide).toContain('width="752" height="208"');
  });
  it('never emits a negative box for tiny cards', () => {
    const svg = renderErrorCard('error', { width: 10, height: 10 });
    expect(svg).not.toMatch(/width="-|height="-/);
  });
});
