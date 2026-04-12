import { describe, expect, it } from 'vitest';
import { formatCount, formatDuration } from '../src/format.js';

describe('formatDuration', () => {
  it('formats short durations as M:SS', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(124.96)).toBe('2:05');
    expect(formatDuration(335.5)).toBe('5:36');
  });
  it('formats long durations as H:MM:SS', () => {
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3725)).toBe('1:02:05');
  });
  it('handles invalid input', () => {
    expect(formatDuration(Number.NaN)).toBe('0:00');
    expect(formatDuration(-5)).toBe('0:00');
  });
});

describe('formatCount', () => {
  it('formats 0-999 as exact', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(7)).toBe('7');
    expect(formatCount(736)).toBe('736');
  });
  it('formats 1k-9.9k', () => {
    expect(formatCount(1000)).toBe('1k');
    expect(formatCount(1234)).toBe('1.2k');
    expect(formatCount(9999)).toBe('10k');
  });
  it('formats 10k-999k', () => {
    expect(formatCount(12345)).toBe('12k');
    expect(formatCount(987654)).toBe('987k');
  });
  it('formats 1M+', () => {
    expect(formatCount(1_234_567)).toBe('1.2M');
    expect(formatCount(12_345_678)).toBe('12M');
  });
});
