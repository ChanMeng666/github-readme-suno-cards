import type { SunoProfile, SunoSong } from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import {
  renderServiceBlock,
  renderServiceProfileLine,
  renderServiceSongLine,
} from '../src/template.js';

function makeSong(overrides: Partial<SunoSong> = {}): SunoSong {
  const base: SunoSong = {
    id: 'a885e43c-6918-456f-a5f0-0e8e29e61066',
    title: '冷酷史官的注脚',
    status: 'complete',
    isPublic: true,
    isPinned: false,
    explicit: false,
    author: { displayName: 'Chan', handle: 'chanmeng', avatarUrl: null, userId: 'u1' },
    coverUrl: '',
    coverLargeUrl: '',
    audioUrl: '',
    videoUrl: null,
    tags: [],
    classifiedTags: {
      genre: [],
      era: [],
      instrument: [],
      mood: [],
      vocal: [],
      key: [],
      production: [],
      tempo: [],
      other: [],
    },
    lyrics: null,
    durationSeconds: 125,
    playCount: 7,
    likeCount: 2,
    commentCount: 0,
    createdAt: '2026-02-07T06:49:35.705Z',
    isNew: false,
    modelVersion: 'v4.5-all',
    modelName: 'chirp-auk',
    modelBadgeTheme: null,
    shareUrl: 'https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066',
    embedUrl: 'https://suno.com/embed/a885e43c-6918-456f-a5f0-0e8e29e61066',
    source: 'clip',
  };
  return { ...base, ...overrides };
}

function makeProfile(): SunoProfile {
  return {
    userId: 'u1',
    handle: 'chanmeng',
    displayName: 'Chan',
    avatarUrl: null,
    description: '',
    isVerified: false,
    totalClips: 26,
    stats: { totalPlays: 736, totalLikes: 55, followers: 2, following: 3 },
    playlists: [],
    shareUrl: 'https://suno.com/@chanmeng',
  };
}

describe('renderServiceSongLine', () => {
  it('emits a markdown image → link with auto theme', () => {
    const line = renderServiceSongLine(makeSong(), {
      baseUrl: 'https://github-readme-suno-cards.vercel.app',
      theme: 'auto',
      outputType: 'markdown',
    });
    expect(line).toBe(
      '[![冷酷史官的注脚](https://github-readme-suno-cards.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&theme=auto)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)',
    );
  });

  it('pins theme when not auto in markdown mode', () => {
    const line = renderServiceSongLine(makeSong(), {
      baseUrl: 'https://github-readme-suno-cards.vercel.app',
      theme: 'dark',
      outputType: 'markdown',
    });
    expect(line).toContain('theme=dark');
  });

  it('emits <picture> block in html output mode', () => {
    const line = renderServiceSongLine(makeSong(), {
      baseUrl: 'https://github-readme-suno-cards.vercel.app',
      theme: 'auto',
      outputType: 'html',
    });
    expect(line).toContain('<picture>');
    expect(line).toContain('media="(prefers-color-scheme: dark)"');
    expect(line).toContain('theme=dark');
    expect(line).toContain('theme=light');
  });

  it('escapes brackets in titles for markdown safety', () => {
    const line = renderServiceSongLine(makeSong({ title: 'Song [remix]' }), {
      baseUrl: 'https://github-readme-suno-cards.vercel.app',
      theme: 'auto',
      outputType: 'markdown',
    });
    expect(line).not.toContain('[remix]');
    expect(line).toContain('Song remix');
  });

  it('includes optional color params in the URL', () => {
    const line = renderServiceSongLine(makeSong(), {
      baseUrl: 'https://github-readme-suno-cards.vercel.app',
      theme: 'auto',
      outputType: 'markdown',
      bgColor: '#0a0a0f',
      accentColor: '8b5cf6',
    });
    expect(line).toContain('bg_color=0a0a0f');
    expect(line).toContain('accent_color=8b5cf6');
  });
});

describe('renderServiceProfileLine', () => {
  it('emits a profile URL as markdown', () => {
    const line = renderServiceProfileLine(makeProfile(), {
      baseUrl: 'https://github-readme-suno-cards.vercel.app',
      theme: 'auto',
      outputType: 'markdown',
    });
    expect(line).toContain('/api/profile?handle=chanmeng');
    expect(line).toContain('(https://suno.com/@chanmeng)');
  });
});

describe('renderServiceBlock', () => {
  it('joins profile + N song lines with blank line separator', () => {
    const block = renderServiceBlock(
      makeProfile(),
      [makeSong(), makeSong({ id: 'other-id', title: 'Other' })],
      {
        baseUrl: 'https://github-readme-suno-cards.vercel.app',
        theme: 'auto',
        outputType: 'markdown',
      },
    );
    const lines = block.split('\n\n');
    expect(lines).toHaveLength(3); // profile + 2 songs
    expect(lines[0]).toContain('/api/profile');
    expect(lines[1]).toContain('a885e43c');
    expect(lines[2]).toContain('other-id');
  });

  it('omits profile line when profile is null', () => {
    const block = renderServiceBlock(null, [makeSong()], {
      baseUrl: 'https://github-readme-suno-cards.vercel.app',
      theme: 'auto',
      outputType: 'markdown',
    });
    expect(block.split('\n\n')).toHaveLength(1);
    expect(block).not.toContain('/api/profile');
  });
});
