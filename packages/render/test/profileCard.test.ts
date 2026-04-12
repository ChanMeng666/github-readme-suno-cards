import type { SunoProfile } from '@suno-cards/parser';
import { describe, expect, it } from 'vitest';
import { renderSingleProfileSvg } from '../src/cardStack.js';
import { renderProfileCard } from '../src/profileCard.js';
import { loadProfileResponse } from './_helpers.js';

function buildProfile(): SunoProfile {
  const raw = loadProfileResponse();
  return {
    userId: raw.user_id,
    handle: raw.handle,
    displayName: raw.display_name ?? '',
    avatarUrl: raw.avatar_image_url,
    description: raw.profile_description ?? '',
    isVerified: raw.is_verified ?? false,
    totalClips: raw.num_total_clips,
    stats: {
      totalPlays: raw.stats.play_count__sum ?? 0,
      totalLikes: raw.stats.upvote_count__sum ?? 0,
      followers: raw.stats.followers_count ?? 0,
      following: raw.stats.following_count ?? 0,
    },
    playlists: [],
    shareUrl: `https://suno.com/@${raw.handle}`,
  };
}

describe('renderProfileCard', () => {
  const profile = buildProfile();

  it('emits a <g class="profile-card"> group', () => {
    const svg = renderProfileCard(profile);
    expect(svg).toContain('<g class="profile-card"');
  });

  it('shows the handle with @ prefix', () => {
    const svg = renderProfileCard(profile);
    expect(svg).toContain('@chanmeng');
  });

  it('renders the display name separately when different', () => {
    const svg = renderProfileCard(profile);
    expect(svg).toContain('Chan');
  });

  it('includes the real aggregate stats', () => {
    const svg = renderProfileCard(profile);
    expect(svg).toContain('26'); // total clips
    expect(svg).toContain('736'); // total plays
    expect(svg).toContain('55'); // total likes
  });

  it('localizes labels to Chinese', () => {
    const svg = renderProfileCard(profile, { lang: 'zh' });
    expect(svg).toContain('播放');
    expect(svg).toContain('点赞');
  });

  it('renders the avatar as data URI when provided', () => {
    const svg = renderProfileCard(profile, { avatarDataUri: 'data:image/webp;base64,ZZZZ' });
    expect(svg).toContain('data:image/webp;base64,ZZZZ');
  });
});

describe('renderSingleProfileSvg', () => {
  it('wraps profile card in SVG root', () => {
    const profile = buildProfile();
    const svg = renderSingleProfileSvg(profile);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('<defs>');
  });
});
