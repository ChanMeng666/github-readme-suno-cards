# github-readme-suno-cards

Display your [Suno AI](https://suno.com/)-generated music as dynamic, animated SVG cards in your GitHub profile README.

[![CI](https://github.com/ChanMeng666/github-readme-suno-cards/actions/workflows/ci.yml/badge.svg)](https://github.com/ChanMeng666/github-readme-suno-cards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000)](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/)

> **Give us your Suno handle and do nothing else.** Your GitHub README stays in sync with your music — new songs, play counts, and likes appear automatically.


---

## Style Gallery

Mix and match **layouts**, **color presets**, and **element toggles** to build the card that fits your README.

### Layouts + Presets

#### Classic + Default (original)

Info-dense layout with purple accent — title, author, tags, stats, model badge.

[![Classic Default](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID)](https://suno.com/song/YOUR_SONG_UUID)
```

#### Classic + Suno Preset

Info-dense layout with Suno's official navy + gold palette.

[![Classic Suno](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&preset=suno)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&preset=suno)](https://suno.com/song/YOUR_SONG_UUID)
```

#### Player + Default

Suno-style music player with progress bar, play button, and SUNO logo — using the default purple theme.

[![Player Default](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&layout=player)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&layout=player)](https://suno.com/song/YOUR_SONG_UUID)
```

#### Player + Suno Preset

The full Suno official look — player layout with navy + gold palette.

[![Player Suno](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&layout=player&preset=suno)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&layout=player&preset=suno)](https://suno.com/song/YOUR_SONG_UUID)
```

### Theme Variants

#### Player + Suno (Dark)

[![Player Suno Dark](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&layout=player&preset=suno&theme=dark)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&layout=player&preset=suno&theme=dark)](https://suno.com/song/YOUR_SONG_UUID)
```

#### Classic + Default (Light)

[![Classic Light](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&theme=light)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&theme=light)](https://suno.com/song/YOUR_SONG_UUID)
```

### Toggle Showcases

#### Player — No Equalizer

Player layout with equalizer bars hidden.

[![Player No EQ](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&layout=player&preset=suno&show_equalizer=false)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&layout=player&preset=suno&show_equalizer=false)](https://suno.com/song/YOUR_SONG_UUID)
```

#### Player — With Tags & Author

Player layout with extra metadata enabled.

[![Player Tags](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&layout=player&preset=suno&show_tags=true&show_author=true)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&layout=player&preset=suno&show_tags=true&show_author=true)](https://suno.com/song/YOUR_SONG_UUID)
```

#### Classic — Minimal

Classic layout stripped down to cover + title only.

[![Classic Minimal](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&show_tags=false&show_plays=false&show_likes=false&show_model_badge=false&show_equalizer=false)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&show_tags=false&show_plays=false&show_likes=false&show_model_badge=false&show_equalizer=false)](https://suno.com/song/YOUR_SONG_UUID)
```

#### Player — Custom Accent Color

Player layout with a custom red accent override.

[![Player Custom](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&layout=player&preset=suno&accent_color=ff6b6b)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&layout=player&preset=suno&accent_color=ff6b6b)](https://suno.com/song/YOUR_SONG_UUID)
```

### Profile & Card Stack

[![My Suno profile](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/profile?handle=chanmeng)](https://suno.com/@chanmeng)

```markdown
[![](https://sunocards.vercel.app/api/profile?handle=YOUR_HANDLE)](https://suno.com/@YOUR_HANDLE)
```

---

## Features

- 🎨 **Two layouts** — `classic` (info-dense Spotify-style) and `player` (Suno-style music player with progress bar)
- 🎨 **Two color presets** — `default` (purple) and `suno` (official navy + gold), freely combinable with any layout
- 🎛️ **Fine-grained element toggles** — show/hide equalizer, progress bar, tags, stats, logo, link icon, and more
- 🎨 **Custom color overrides** — `bg_color`, `text_color`, `accent_color` on top of any preset
- 🎵 **Spotify-style animated equalizer bars** — 4 CSS-animated bars overlay your cover art
- 🎯 **Handle-based auto-discovery** — set your handle once, new songs appear automatically
- 🌓 **Dark/light theme** auto-switches with GitHub's UI theme
- 🏷️ **Smart tag classification** — genres, instruments, moods, vocal types, and tempo rendered as distinct chips
- 🎖️ **Suno-native model badges** — the `v4.5-all` / `v5` badges use the exact theme tokens from Suno's own UI
- 🆕 **"NEW" ribbon** on songs published in the last 7 days
- 📊 **Profile summary card** — avatar, handle, total plays, likes, followers
- 🌐 **Multi-language** — English, 简体中文, 日本語 out of the box
- ⚡ **Vercel Edge Runtime** — cold start 30–80 ms, warm requests ~20 ms from the edge cache
- 🔒 **Compliance-first** — uses only the public `studio-api-prod.suno.com` endpoints that Suno itself publishes as their oEmbed provider; no cookies, no reverse-engineered auth

## Quick start

### 1. Add the markers to your README

```markdown
## My Suno music

<!-- SUNO-CARDS:START -->
<!-- SUNO-CARDS:END -->
```

### 2. Create `.github/workflows/suno-cards.yml`

```yaml
name: Update Suno cards

on:
  schedule:
    - cron: '0 */6 * * *'   # Every 6 hours
  workflow_dispatch:

permissions:
  contents: write

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ChanMeng666/github-readme-suno-cards@v0.1
        with:
          handle: YOUR_SUNO_HANDLE
          sort: play_count
          max: 6
      - uses: EndBug/add-and-commit@v9
        with:
          message: 'chore(suno-cards): refresh'
          add: './README.md'
```

### 3. That's it.

Every 6 hours (or whenever you click "Run workflow"), the Action fetches your public songs from Suno, sorts/filters them, and writes the markdown block between your markers.

## Alternative: embed a single card directly

If you don't want to run a GitHub Action, you can embed a single card URL straight in your README — no setup required:

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID)](https://suno.com/song/YOUR_SONG_UUID)
```

Use the player layout with Suno's official colors:

```markdown
[![](https://sunocards.vercel.app/api/card?id=YOUR_SONG_UUID&layout=player&preset=suno)](https://suno.com/song/YOUR_SONG_UUID)
```

## Render modes

### `service` (default)

The Action writes markdown pointing at the hosted Vercel service. Cards auto-update whenever anyone views your README — play counts, NEW badges, and any data change reflects live. No SVG files are committed to your repo.

### `local`

The Action pre-renders SVGs into `.suno-cards/` in your repo and commits them alongside the README update. Zero dependency on any hosted service — your README works offline, in mirrors, and in git history forever. Switch via `render_mode: local` in the workflow inputs.

## Endpoints (for direct embedding)

| Endpoint | Description |
|---|---|
| `/api/card?id=<uuid\|short\|url>` | Single song card |
| `/api/profile?handle=<handle>` | Profile summary card |
| `/api/cards?handle=<handle>&sort=<...>&max=<N>` | Stacked N-card auto-discovery |
| `/song/<uuid>` | Pretty URL alias for `/api/card?id=<uuid>` |

All endpoints accept the same query parameters as the Action inputs below.

## Action inputs

### Data source (pick one)

| Input | Default | Description |
|---|---|---|
| `handle` | — | Your Suno handle — enables auto-discovery mode |
| `manifest_path` | `./suno-songs.yml` | Path to a YAML manifest of song IDs |
| `song_ids` | — | Alternative: comma-separated UUIDs inline |

### Filters & ranking

| Input | Default | Description |
|---|---|---|
| `sort` | `created_at` | `created_at` \| `play_count` \| `upvote_count` \| `name` |
| `max` | `6` | Max song cards to render (1–20) |
| `include_tags` | — | CSV substring filter (case-insensitive) |
| `exclude_tags` | — | CSV substring filter |
| `min_duration` / `max_duration` | — | Seconds |
| `min_plays` / `min_likes` | — | Integer floors |
| `pinned_first` | `true` | Respect `is_pinned` above sort order |
| `featured` | — | CSV of UUIDs pinned above everything |
| `allow_explicit` | `true` | Include explicit-tagged songs |
| `show_profile_card` | `true` | Emit profile summary card above the song cards |

### Visual style

| Input | Default | Description |
|---|---|---|
| `layout` | `classic` | `classic` (info-dense) or `player` (Suno-style with progress bar) |
| `preset` | `default` | `default` (purple) or `suno` (navy + gold) |
| `show_progress` | layout-dependent | Show progress bar + play button (default: `true` for player, `false` for classic) |
| `show_logo` | layout-dependent | Show SUNO logo in bottom-right (default: `true` for player) |
| `show_link_icon` | layout-dependent | Show link icon in top-right (default: `true` for player) |

### Output & styling

| Input | Default | Description |
|---|---|---|
| `render_mode` | `service` | `service` (hosted) or `local` (pre-render SVGs) |
| `local_cards_dir` | `.suno-cards` | Output dir in local mode |
| `readme_path` | `./README.md` | Path to README file |
| `comment_tag_name` | `SUNO-CARDS` | Marker name (allows multiple instances in one README) |
| `output_type` | `markdown` | `markdown` or `html` (with `<picture>` for theme switching) |
| `theme` | `auto` | `auto` / `dark` / `light` |
| `lang` | `en` | `en` / `zh` / `ja` |
| `width` | — | Card width in px (200–1200) |
| `bg_color` | — | Card background hex (with or without `#`) |
| `text_color` | — | Title / primary text color |
| `accent_color` | — | Accent color (equalizer bars, chips, progress bar) |
| `base_url` | `https://sunocards.vercel.app` | Self-hosted service override |
| `output_only` | `false` | Skip README write, emit via action outputs only |

### Element toggles

All toggles default to layout-appropriate values. You can override any of them regardless of layout.

| Input | Classic default | Player default | Description |
|---|---|---|---|
| `show_equalizer` | `true` | `true` | Animated equalizer bars on cover |
| `show_tags` | `true` | `false` | Genre/mood tag chips |
| `show_plays` | `true` | `false` | Play count stat |
| `show_likes` | `true` | `false` | Like count stat |
| `show_author` | `true` | `false` | Author byline |
| `show_duration` | `true` | `false` | Duration pill on cover |
| `show_model_badge` | `true` | `false` | Suno model badge |
| `show_new_badge` | `true` | `false` | NEW ribbon on recent songs |

### Outputs (for chained workflow steps)

- `profile` — JSON-encoded `SunoProfile`
- `clips` — JSON-encoded array of `SunoSong`
- `cards_block` — the markdown/HTML block written to README
- `rendered_files` — JSON array of SVG paths (local mode only)

## Examples

See [`examples/`](./examples) for ready-to-copy workflow files:

- [`auto-discovery.yml`](./examples/auto-discovery.yml) — the flagship mode, zero config beyond your handle
- [`manifest-mode.yml`](./examples/manifest-mode.yml) — explicit song list via YAML
- [`local-mode.yml`](./examples/local-mode.yml) — pre-render SVGs to your repo
- [`suno-songs.yml`](./examples/suno-songs.yml) — sample manifest file

## Architecture

The project is a pnpm monorepo with four packages:

```
packages/parser    — Suno API client + Valibot schemas (zero HTML scraping)
packages/render    — SVG card primitives (pure, no network I/O)
apps/web           — Next.js 15 on Vercel Edge Runtime (3 route handlers)
action             — Node 20 GitHub Action (esbuild-bundled)
```

**Data source**: `https://studio-api-prod.suno.com/api/clip/{uuid}` and `/api/profiles/{handle}` — both are unauthenticated public JSON endpoints that Suno publishes via `<link rel="alternate" type="application/json+oembed">` in their HTML. No cookies, no session tokens, no reverse-engineered internal APIs.

**Rendering**: template-literal SVG strings with `<foreignObject>` for CJK-friendly rich text, CSS `@media (prefers-color-scheme)` for auto theming, and CSS keyframes on HTML `<span>`s inside the foreignObject for the animated equalizer (the same technique [`spotify-github-profile`](https://github.com/kittinan/spotify-github-profile) uses).

**Caching**: dual-layer — Vercel Data Cache hint on upstream Suno calls (`next: { revalidate: 3600 }`), plus HTTP `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` for the downstream GitHub Camo proxy direction.

## Roadmap

### v0.2

- [ ] **Waveform card variant** (Action local mode only) — download MP3 from `cdn1.suno.ai`, compute amplitude samples, render SVG `<path>` like SoundCloud
- [ ] **Lyrics excerpt card** — parse `[Chorus]` from structured prompt, render as card subtitle
- [ ] **Playlist card** — render Suno playlists
- [ ] **JSON API** — `/api/song.json` and `/api/profile.json` for third-party tools
- [ ] **PNG export** — `/api/card.png` via `@resvg/resvg`

### v0.3

- [ ] **Vercel KV play-count history** — trending arrows (`↑ +15 this week`), weekly summaries
- [ ] **RSS/Atom feed per handle** — `/api/feed/{handle}.xml`, consumable by `blog-post-workflow`
- [ ] **Landing page with live configurator** — paste handle → preview → copy snippet

### v0.4+

- [ ] Cover-art color extraction for per-song gradient backgrounds
- [ ] Song-DNA radar chart card
- [ ] Year-in-review card

## Acknowledgements

The card primitives borrow ideas from several excellent projects:

- [`github-readme-medium-recent-article`](https://github.com/omidnikrah/github-readme-medium-recent-article) — Next.js + Vercel architecture
- [`github-readme-youtube-cards`](https://github.com/DenverCoder1/github-readme-youtube-cards) — dual-mode Action + service, theme switching
- [`blog-post-workflow`](https://github.com/gautamkrishnar/blog-post-workflow) — esbuild bundling, marker-replace regex, CI dist-diff verification
- [`spotify-github-profile`](https://github.com/kittinan/spotify-github-profile) — CSS-animated equalizer overlay technique

## License

[MIT](./LICENSE)

---

Made with music by [Suno](https://suno.com/)
