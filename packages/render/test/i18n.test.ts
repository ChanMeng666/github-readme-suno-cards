import { describe, expect, it } from 'vitest';
import { formatRelativeTime, pickLang, t } from '../src/i18n/index.js';

describe('pickLang', () => {
  it('returns en for null/undefined/empty', () => {
    expect(pickLang(null)).toBe('en');
    expect(pickLang(undefined)).toBe('en');
    expect(pickLang('')).toBe('en');
  });
  it('recognizes zh', () => {
    expect(pickLang('zh')).toBe('zh');
    expect(pickLang('zh-CN')).toBe('zh');
    expect(pickLang('zh-CN,zh;q=0.9,en;q=0.8')).toBe('zh');
  });
  it('recognizes ja', () => {
    expect(pickLang('ja-JP')).toBe('ja');
    expect(pickLang('ja,en;q=0.5')).toBe('ja');
  });
  it('falls back to en on unknown', () => {
    expect(pickLang('xx-YY')).toBe('en');
  });
});

describe('t', () => {
  it('returns localized strings', () => {
    expect(t('en', 'plays')).toBe('plays');
    expect(t('zh', 'plays')).toBe('播放');
    expect(t('ja', 'plays')).toBe('再生');
  });
  it('interpolates params', () => {
    expect(t('en', 'minutes_ago', { n: 5 })).toBe('5m ago');
    expect(t('zh', 'minutes_ago', { n: 5 })).toBe('5 分钟前');
  });
});

describe('formatRelativeTime', () => {
  const NOW = Date.parse('2026-04-12T12:00:00.000Z');

  it('renders just now for <5s', () => {
    expect(formatRelativeTime('2026-04-12T11:59:58.000Z', 'en', NOW)).toBe('just now');
  });
  it('renders seconds', () => {
    expect(formatRelativeTime('2026-04-12T11:59:30.000Z', 'en', NOW)).toBe('30s ago');
  });
  it('renders minutes', () => {
    expect(formatRelativeTime('2026-04-12T11:45:00.000Z', 'en', NOW)).toBe('15m ago');
  });
  it('renders hours', () => {
    expect(formatRelativeTime('2026-04-12T09:00:00.000Z', 'en', NOW)).toBe('3h ago');
  });
  it('renders days', () => {
    expect(formatRelativeTime('2026-04-09T12:00:00.000Z', 'en', NOW)).toBe('3d ago');
  });
  it('renders weeks', () => {
    expect(formatRelativeTime('2026-04-01T12:00:00.000Z', 'en', NOW)).toBe('1w ago');
  });
  it('renders months', () => {
    expect(formatRelativeTime('2026-02-01T12:00:00.000Z', 'en', NOW)).toBe('2mo ago');
  });
  it('localizes to Chinese', () => {
    expect(formatRelativeTime('2026-04-09T12:00:00.000Z', 'zh', NOW)).toBe('3 天前');
  });
});
