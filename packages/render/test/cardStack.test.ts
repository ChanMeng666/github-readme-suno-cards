import { mapClipToSong } from '@suno-cards/parser';
import type { SunoProfile } from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import { renderCardStack } from '../src/cardStack.js';
import { loadClipResponse, loadProfileResponse } from './_helpers.js';

function buildProfile(): SunoProfile {
  const raw = loadProfileResponse();
  return {
    userId: raw.user_id,
    handle: raw.handle,
    displayName: raw.display_name ?? '',
    avatarUrl: raw.avatar_image_url,
    description: raw.profile_description ?? '',
    isVerified: false,
    totalClips: raw.num_total_clips,
    stats: {
      totalPlays: raw.stats.play_count__sum ?? 0,
      totalLikes: raw.stats.upvote_count__sum ?? 0,
      followers: raw.stats.followers_count ?? 0,
      following: raw.stats.following_count ?? 0,
    },
    playlists: [],
    shareUrl: '',
  };
}

describe('renderCardStack', () => {
  const profile = buildProfile();
  const song = mapClipToSong(loadClipResponse(), 'clip');

  it('stacks profile + 3 song cards into one SVG with a matching total height', () => {
    const svg = renderCardStack([
      { kind: 'profile', profile },
      { kind: 'song', song },
      { kind: 'song', song },
      { kind: 'song', song },
    ]);
    expect(svg.startsWith('<svg')).toBe(true);
    // 90 (profile) + 140*3 (songs) + 10*3 gaps = 540
    expect(svg).toContain('height="540"');
    expect(svg).toContain('<g class="profile-card"');
    // Should contain 3 song cards
    const matches = svg.match(/<g class="song-card"/g);
    expect(matches).toHaveLength(3);
  });

  it('handles an empty list gracefully', () => {
    const svg = renderCardStack([]);
    expect(svg).toContain('<svg');
    expect(svg).toContain('height="40"');
  });

  it('propagates theme to root SVG (pinned dark → one :root block from themeCss)', () => {
    const svg = renderCardStack([{ kind: 'song', song }], { theme: 'dark' });
    const rootBlocks = svg.match(/:root\s*\{/g) ?? [];
    expect(rootBlocks.length).toBe(1);
    expect(svg).toContain('--c-bg:');
  });

  it('translates localized labels throughout the stack', () => {
    const svg = renderCardStack(
      [
        { kind: 'profile', profile },
        { kind: 'song', song },
      ],
      { lang: 'zh' },
    );
    expect(svg).toContain('作者'); // "by" in song card
    expect(svg).toContain('播放'); // "plays" in profile card
  });
});
