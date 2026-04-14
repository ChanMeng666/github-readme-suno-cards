import type { CardConfig } from './cardParams.js';
import { getDefaultConfig, getLayoutDefaults } from './cardParams.js';
import { DEMO_UUID } from './constants.js';

export type GalleryPreset = {
  title: string;
  description: string;
  config: CardConfig;
};

function preset(title: string, description: string, overrides: Partial<CardConfig>): GalleryPreset {
  const layout = overrides.layout ?? 'classic';
  const base = {
    ...getDefaultConfig(DEMO_UUID),
    ...getLayoutDefaults(layout),
    layout,
    ...overrides,
    id: DEMO_UUID,
  };
  return { title, description, config: base };
}

export const GALLERY_PRESETS: GalleryPreset[] = [
  // ── Core combinations ────────────────────────────────
  preset('Classic + Default (Dark)', 'Info-dense layout with purple accent.', {
    layout: 'classic',
    preset: 'default',
    theme: 'dark',
  }),
  preset('Classic + Default (Light)', 'Classic card for light-background READMEs.', {
    layout: 'classic',
    preset: 'default',
    theme: 'light',
  }),
  preset('Classic + Suno (Dark)', 'Info-dense layout with official navy + gold palette.', {
    layout: 'classic',
    preset: 'suno',
    theme: 'dark',
  }),
  preset('Classic + Suno (Light)', 'Suno navy + gold in light mode.', {
    layout: 'classic',
    preset: 'suno',
    theme: 'light',
  }),
  preset('Player + Default (Dark)', 'Music player style with progress bar and purple theme.', {
    layout: 'player',
    preset: 'default',
    theme: 'dark',
  }),
  preset('Player + Default (Light)', 'Player layout in clean light mode.', {
    layout: 'player',
    preset: 'default',
    theme: 'light',
  }),
  preset('Player + Suno (Dark)', 'Full Suno look — player with navy + gold.', {
    layout: 'player',
    preset: 'suno',
    theme: 'dark',
  }),
  preset('Player + Suno (Light)', 'Suno player in light mode.', {
    layout: 'player',
    preset: 'suno',
    theme: 'light',
  }),

  // ── Toggle variations ────────────────────────────────
  preset('Minimal Classic', 'Stripped to title and cover only.', {
    layout: 'classic',
    theme: 'dark',
    showTags: false,
    showPlays: false,
    showLikes: false,
    showModelBadge: false,
    showEqualizer: false,
    showNewBadge: false,
    showAuthor: false,
  }),
  preset('Minimal Player', 'Clean player with no extra metadata.', {
    layout: 'player',
    theme: 'dark',
  }),
  preset('Full Info Classic', 'Every element enabled for maximum detail.', {
    layout: 'classic',
    theme: 'dark',
    showProgress: true,
    showLogo: true,
    showLinkIcon: true,
  }),
  preset('Full Info Player', 'Player with tags, author, and stats visible.', {
    layout: 'player',
    preset: 'suno',
    theme: 'dark',
    showTags: true,
    showAuthor: true,
    showPlays: true,
    showLikes: true,
  }),
  preset('No Equalizer Player', 'Player without animated equalizer bars.', {
    layout: 'player',
    preset: 'suno',
    theme: 'dark',
    showEqualizer: false,
  }),
  preset('Player With Stats', 'Player showing play and like counts.', {
    layout: 'player',
    preset: 'default',
    theme: 'dark',
    showPlays: true,
    showLikes: true,
  }),

  // ── Custom accent colors ─────────────────────────────
  preset('Custom Red Accent', 'Player with a warm red accent color.', {
    layout: 'player',
    preset: 'suno',
    theme: 'dark',
    accentColor: 'ff6b6b',
  }),
  preset('Custom Teal Accent', 'Classic card with teal/cyan accent.', {
    layout: 'classic',
    preset: 'default',
    theme: 'dark',
    accentColor: '2dd4bf',
  }),
  preset('Custom Orange Accent', 'Player with vibrant orange accent.', {
    layout: 'player',
    preset: 'default',
    theme: 'dark',
    accentColor: 'fb923c',
  }),
  preset('Custom Pink Accent', 'Classic card with hot pink accent.', {
    layout: 'classic',
    preset: 'default',
    theme: 'dark',
    accentColor: 'f472b6',
  }),
  preset('Custom Green Accent', 'Player with Spotify-like green accent.', {
    layout: 'player',
    preset: 'default',
    theme: 'dark',
    accentColor: '22c55e',
  }),
  preset('Custom Blue Accent', 'Classic card with sky blue accent.', {
    layout: 'classic',
    preset: 'default',
    theme: 'dark',
    accentColor: '38bdf8',
  }),
];
