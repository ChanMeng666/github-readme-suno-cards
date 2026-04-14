import * as core from '@actions/core';
import type { SortKey } from '@suno-cards/parser';
import type { CardLayout, PresetName, ThemeMode } from '@suno-cards/render';

/**
 * Read and validate Action inputs from `core.getInput()`. All inputs are
 * strings at the GitHub Actions boundary — this module turns them into
 * typed values with defaults, mirroring the route-handler query readers
 * in `apps/web/lib/query.ts`.
 */

export type ActionInputs = {
  // Data source
  handle: string | null;
  manifestPath: string | null;
  songIds: string[] | null;

  // Filters & ranking
  sort: SortKey;
  max: number;
  includeTags: string[] | null;
  excludeTags: string[] | null;
  minDuration: number | null;
  maxDuration: number | null;
  minPlays: number | null;
  minLikes: number | null;
  pinnedFirst: boolean;
  featured: string[] | null;
  allowExplicit: boolean;
  showProfileCard: boolean;

  // Visual style
  layout: CardLayout;
  preset: PresetName;
  showProgress: boolean | null;
  showLogo: boolean | null;
  showLinkIcon: boolean | null;

  // Output
  renderMode: 'service' | 'local';
  localCardsDir: string;
  readmePath: string;
  commentTagName: string;
  outputType: 'markdown' | 'html';
  theme: ThemeMode;
  lang: 'en' | 'zh' | 'ja';
  width: number | null;
  bgColor: string | null;
  textColor: string | null;
  accentColor: string | null;
  baseUrl: string;

  // Commit behavior
  outputOnly: boolean;
  commitMessage: string;
  committerUsername: string;
  committerEmail: string;
};

function str(name: string, fallback = ''): string {
  const v = core.getInput(name);
  return v.trim() || fallback;
}

function maybeStr(name: string): string | null {
  const v = str(name);
  return v === '' ? null : v;
}

function bool(name: string, fallback: boolean): boolean {
  const v = core.getInput(name).trim().toLowerCase();
  if (v === '') return fallback;
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

function int(name: string, min: number, max: number, fallback: number | null): number | null {
  const v = str(name);
  if (!v) return fallback;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function csv(name: string): string[] | null {
  const v = str(name);
  if (!v) return null;
  const parts = v
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts : null;
}

function enumIn<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  const v = str(name).toLowerCase() as T;
  return allowed.includes(v) ? v : fallback;
}

function hex(name: string): string | null {
  const v = str(name);
  if (!v) return null;
  const cleaned = v.replace(/^#/, '');
  if (/^[0-9a-fA-F]{6}$/.test(cleaned) || /^[0-9a-fA-F]{8}$/.test(cleaned)) {
    return `#${cleaned}`;
  }
  return null;
}

export function readInputs(): ActionInputs {
  return {
    handle: maybeStr('handle'),
    manifestPath: maybeStr('manifest_path'),
    songIds: csv('song_ids'),

    sort: enumIn(
      'sort',
      ['created_at', 'play_count', 'upvote_count', 'name'] as const,
      'created_at',
    ),
    max: int('max', 1, 20, 6) ?? 6,
    includeTags: csv('include_tags'),
    excludeTags: csv('exclude_tags'),
    minDuration: int('min_duration', 0, 3600, null),
    maxDuration: int('max_duration', 0, 3600, null),
    minPlays: int('min_plays', 0, 1_000_000, null),
    minLikes: int('min_likes', 0, 1_000_000, null),
    pinnedFirst: bool('pinned_first', true),
    featured: csv('featured'),
    allowExplicit: bool('allow_explicit', true),
    showProfileCard: bool('show_profile_card', true),

    layout: enumIn('layout', ['classic', 'player'] as const, 'classic'),
    preset: enumIn('preset', ['default', 'suno'] as const, 'default'),
    showProgress: maybeStr('show_progress') != null ? bool('show_progress', false) : null,
    showLogo: maybeStr('show_logo') != null ? bool('show_logo', false) : null,
    showLinkIcon: maybeStr('show_link_icon') != null ? bool('show_link_icon', false) : null,

    renderMode: enumIn('render_mode', ['service', 'local'] as const, 'service'),
    localCardsDir: str('local_cards_dir', '.suno-cards'),
    readmePath: str('readme_path', './README.md'),
    commentTagName: str('comment_tag_name', 'SUNO-CARDS'),
    outputType: enumIn('output_type', ['markdown', 'html'] as const, 'markdown'),
    theme: enumIn('theme', ['auto', 'dark', 'light'] as const, 'auto'),
    lang: enumIn('lang', ['en', 'zh', 'ja'] as const, 'en'),
    width: int('width', 200, 1200, null),
    bgColor: hex('bg_color'),
    textColor: hex('text_color'),
    accentColor: hex('accent_color'),
    baseUrl: str('base_url', 'https://sunocards.vercel.app'),

    outputOnly: bool('output_only', false),
    commitMessage: str('commit_message', 'chore(suno-cards): update README'),
    committerUsername: str('committer_username', 'github-actions[bot]'),
    committerEmail: str('committer_email', '41898282+github-actions[bot]@users.noreply.github.com'),
  };
}
