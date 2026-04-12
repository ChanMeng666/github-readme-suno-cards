import en from './locales/en.json' with { type: 'json' };
import ja from './locales/ja.json' with { type: 'json' };
import zh from './locales/zh.json' with { type: 'json' };

export type LocaleKey = keyof typeof en;
export type Lang = 'en' | 'zh' | 'ja';

const DICTS: Record<Lang, Record<LocaleKey, string>> = {
  en: en as Record<LocaleKey, string>,
  zh: zh as Record<LocaleKey, string>,
  ja: ja as Record<LocaleKey, string>,
};

export const SUPPORTED_LANGS: readonly Lang[] = ['en', 'zh', 'ja'];

/**
 * Pick a locale from an Accept-Language header value or a simple lang code.
 * Falls back to 'en' on unknown inputs.
 */
export function pickLang(input: string | null | undefined): Lang {
  if (!input) return 'en';
  const lowered = input.toLowerCase();
  // Very light parser — just check which lang tag prefixes the string
  if (lowered.startsWith('zh')) return 'zh';
  if (lowered.startsWith('ja')) return 'ja';
  if (lowered.startsWith('en')) return 'en';
  // Accept-Language header like "zh-CN,zh;q=0.9,en;q=0.8"
  for (const part of lowered.split(',')) {
    const tag = part.trim().split(';')[0] ?? '';
    if (tag.startsWith('zh')) return 'zh';
    if (tag.startsWith('ja')) return 'ja';
    if (tag.startsWith('en')) return 'en';
  }
  return 'en';
}

export function t(lang: Lang, key: LocaleKey, params?: Record<string, string | number>): string {
  const dict = DICTS[lang] ?? DICTS.en;
  let str = dict[key] ?? DICTS.en[key];
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

/**
 * Format a past ISO timestamp as a localized relative-time string.
 * Uses coarse buckets (seconds / minutes / hours / days / weeks / months / years).
 */
export function formatRelativeTime(
  iso: string,
  lang: Lang = 'en',
  nowMs: number = Date.now(),
): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return '';
  const diff = Math.max(0, Math.round((nowMs - then) / 1000));
  if (diff < 5) return t(lang, 'just_now');
  if (diff < 60) return t(lang, 'seconds_ago', { n: diff });
  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return t(lang, 'minutes_ago', { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t(lang, 'hours_ago', { n: hours });
  const days = Math.floor(hours / 24);
  if (days < 7) return t(lang, 'days_ago', { n: days });
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return t(lang, 'weeks_ago', { n: weeks });
  const months = Math.floor(days / 30);
  if (months < 12) return t(lang, 'months_ago', { n: months });
  const years = Math.floor(days / 365);
  return t(lang, 'years_ago', { n: years });
}
