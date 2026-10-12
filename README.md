<div align="center">

<img src="docs/logo.svg" alt="Suno Cards logo" width="96" />

# Suno Cards

### Your Suno songs, as cards in your GitHub README.

Give it your Suno handle. Get a live image of your profile and your songs.

<a href="https://github-readme-suno-cards.vercel.app/builder"><img src="./.github/readme/pill-build-your-card.svg" height="40" alt="Build your card"></a> <a href="https://github-readme-suno-cards.vercel.app/gallery"><img src="./.github/readme/pill-gallery.svg" height="40" alt="Gallery"></a> <a href="https://github-readme-suno-cards.vercel.app"><img src="./.github/readme/pill-live-site.svg" height="40" alt="Live site"></a> <a href="docs/overview.md"><img src="./.github/readme/pill-full-overview.svg" height="40" alt="Full overview"></a>

</div>

<br>

<div align="center">
<a href="https://suno.com/@chanmeng666"><img src="https://github-readme-suno-cards.vercel.app/api/cards?handle=chanmeng666&sort=play_count&max=3&theme=dark&preset=suno" alt="A Suno profile card for @chanmeng666 with song, play, like and follower counts, above cards for the three most played songs. Each song card shows its cover, title, tags, plays and likes."></a>

<sub>These are the cards themselves, live, for <a href="https://suno.com/@chanmeng666">@chanmeng666</a>.</sub>
</div>

<br>

## Try it

Paste this into your README and replace `YOUR_HANDLE` with your Suno handle:

```markdown
[![](https://github-readme-suno-cards.vercel.app/api/cards?handle=YOUR_HANDLE&sort=play_count&max=3)](https://suno.com/@YOUR_HANDLE)
```

There is nothing to install. The cards follow GitHub's light and dark mode unless you set a theme.

<br>

<div align="center">

<img src="https://github-readme-suno-cards.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&layout=player&preset=suno&theme=dark" alt="One song as a player card" />

<sub>One song: <code>/api/card?id=YOUR_SONG_UUID&layout=player&preset=suno</code></sub>

<br>

<img src="https://github-readme-suno-cards.vercel.app/api/card?id=a885e43c-6918-456f-a5f0-0e8e29e61066&theme=light" alt="One song as a classic card, light theme" />

<sub>The classic layout: <code>/api/card?id=YOUR_SONG_UUID&theme=light</code></sub>

<br>

<img src="https://github-readme-suno-cards.vercel.app/api/profile?handle=chanmeng666&theme=dark" alt="A profile card on its own" />

<sub>Profile only: <code>/api/profile?handle=YOUR_HANDLE</code></sub>

</div>

<br>

To pick a style by eye, use the [builder](https://github-readme-suno-cards.vercel.app/builder): it previews the card and writes the line for you.

## How it works

```mermaid
flowchart LR
    R([Someone opens<br/>your README]) --> A["/api/cards?handle=..."]
    A --> S[Suno's public API]
    S --> V[SVG renderer]
    V --> C([Cards in<br/>your README])
```

It reads only Suno's public endpoints: no login, no scraping. Cards are cached, so new numbers can take up to an hour to show. Suno changes its public API without notice. What changed, and when, is in the [status notes](docs/overview.md#status--upstream-findings-2026-09).

## For your agent

This page is all a person needs. Every parameter, toggle and colour is in the docs, along with the GitHub Action that writes the cards into your README on a schedule. Clone the repo and point your coding agent at [`AGENTS.md`](AGENTS.md) and [`docs/overview.md`](docs/overview.md).

```bash
git clone https://github.com/ChanMeng666/github-readme-suno-cards.git
```

<sub>[Full overview](docs/overview.md) · [Example workflows](examples) · [Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [MIT](LICENSE)</sub>

<sub>Built by [Chan Meng](https://github.com/ChanMeng666).</sub>
