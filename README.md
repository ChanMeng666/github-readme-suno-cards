# github-readme-suno-cards

Display your [Suno AI](https://suno.com/)-generated music as dynamic, animated SVG cards in your GitHub profile README.

[![CI](https://github.com/ChanMeng666/github-readme-suno-cards/actions/workflows/ci.yml/badge.svg)](https://github.com/ChanMeng666/github-readme-suno-cards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-000)](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/)

> **Give us your Suno handle and do nothing else.** Your GitHub README stays in sync with your music — new songs, play counts, and likes appear automatically.


---

## Live preview

[![My top song](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066)](https://suno.com/song/a885e43c-6918-456f-a5f0-0e8e29e61066)

[![My Suno profile](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/profile?handle=chanmeng)](https://suno.com/@chanmeng)

## Features

- 🎨 **Spotify-style animated equalizer bars** — 4 CSS-animated bars overlay your cover art
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
[![](https://github-readme-suno-cards-lrpl2jknu-chan-mengs-projects.vercel.app/api/card?id=YOUR_SONG_UUID)](https://suno.com/song/YOUR_SONG_UUID)
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
| `accent_color` | — | Accent color (equalizer bars, chips) |
| `base_url` | `https://sunocards.vercel.app` | Self-hosted service override |
| `output_only` | `false` | Skip README write, emit via action outputs only |

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
