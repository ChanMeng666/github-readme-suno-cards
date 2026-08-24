# Project conventions for AI agents

Skim this before changing anything. Most of it is not guessable from the code.

## What this is

A pnpm monorepo that ships **one thing in three shapes**: SVG cards for a GitHub README, built from
Suno's public API.

| Surface | Path | What it is |
|---|---|---|
| Hosted service | `apps/web` | Next.js on Vercel **Edge**. `/api/card`, `/api/profile`, `/api/cards`, `/song/{uuid}`, plus `/`, `/gallery`, `/builder`. |
| GitHub Action | `action.yml` + `action/src` | Node 20. The bundle at `action/dist/index.js` is **committed** — rebuild it when you touch `action/src`. |
| Workspace packages | `packages/parser`, `packages/render` | `private: true`, not published to npm. |

## Build & tooling

- **pnpm workspaces.** `pnpm test` / `pnpm typecheck` are `pnpm -r`, so they only reach workspace
  packages. Vitest for all four.
- **Biome 2** for lint and format (`pnpm check`, `pnpm format`). No ESLint, no Prettier — don't add
  either. `scripts/**`, `**/fixtures/**` and `dist/` are outside its scope.
- Imports inside the packages use explicit `.js` extensions (`from './schema.js'`) — that is ESM
  resolution, not a mistake, and TypeScript wants it that way here.

## The Suno API is not a stable contract — read this before touching the schema

Everything below was measured, and several of the entries exist because an earlier, confident,
written-down claim turned out to be wrong. Expect to be the next one.

- **Every clip field is `v.optional(...)`.** One schema validates five response variants (full clip,
  medium profile, slim shelf, playlist, oEmbed). The cost is that a field Suno *stops sending*
  parses cleanly as `undefined` and looks like nothing happened. Don't "tighten" a field because it
  looks always-present in one fixture.
- **Suno varies the response by `User-Agent`, and it is a PREFIX rule.** A UA whose first four
  characters are `suno` (case-insensitive) gets a different serializer variant, with
  `metadata.secondary_badges` omitted entirely. Prefix, not substring — `xSuno/1.0` gets the normal
  variant. It is **not** bot-vs-browser and **not** identified-vs-anonymous; both readings were
  written down before and both were wrong.
  - **Never start this package's UA with `suno`.** See `packages/parser/src/fetcher.ts`.
  - **Attach the UA to every presence claim.** "Field X is on k of N clips" is not a complete
    statement about this API.
- **Presence rates live as prose k/N comments in JSDoc**, with the date they were measured. Keep
  that habit: an undated presence claim rots invisibly.
- **A curated shelf is heterogeneous.** Alongside generations it carries human uploads and studio
  exports, whose `metadata` has ~13 keys against ~32. Anything that samples element `[0]` of a clip
  array and calls it "the shape" will eventually report a pile of fields as removed. That is why
  `fixtures/editorial-shelf.json` exists, and why its tests assert **kinds, not counts** (the
  fixture is trimmed and deliberately does not preserve upstream ratios).
- **`model_badges` absence means no model generated the clip** — `model_name: "chirp-chirp"` with an
  empty `major_model_version`. Do **not** key it on `metadata.type`; that proxy was tried and broke.
- **`media_urls` lists two tiers; use `audio_url`.** Both URLs are exactly derivable from the clip
  id, so there is nothing new to store, and the `m4a-opus` tier is **not playable** — the browser
  reports the codec as supported and then fails to decode, and the payload carries no container
  header. A two-`<source>` list with the opus tier first is worse than useless. See the schema
  comment for the measurement.

## Compliance posture

Anything read from Suno must be a **public, anonymously reachable** endpoint: `/api/clip/{uuid}`,
`/api/profiles/{handle}`, `/api/playlist/{uuid}`, `/api/oembed`. No HTML scraping, no headless
browsers, no authenticated requests, no `POST` surfaces. Identify honestly in the `User-Agent` and
keep the `+` URL correct — someone reading their server logs should be able to find out who you are.

There is **no `/api/trending` fetcher** and there should not be one: Suno removed that route on
2026-07-24. The object it aliased is still public — ask for it by UUID with `fetchPlaylist(...)` —
but its membership has been frozen since September 2024, so treat it as a historical exhibit and
build nothing time-sensitive on it.

## CDN details worth knowing

- `cdn1.suno.ai` — audio (`{uuid}.mp3`), video, avatars. S3-backed.
- `cdn2.suno.ai` — cover art (`image_{uuid}.jpeg`, `image_large_{uuid}.jpeg`).
- **`?width=N` on a cover works only for `{100, 256, 360, 720}`.** Any other value is a **403**, not
  a smaller image. Always go through `resizeSunoCover()` (`packages/parser/src/cdn.ts`), which snaps
  up to the nearest allowed value and passes non-Suno URLs through untouched.

## Upstream research sync

This repo is downstream of a private research project that probes Suno's API on a schedule. Findings
arrive here by hand — there is no script, and there is no automated sync.

**Two hard rules when syncing:**

1. **Rewrite the prose; never paste it.** The upstream notes cite internal probe paths and
   round numbers that mean nothing here and must not appear in a public repo.
2. **Cite the public write-up, not the private source.** The observatory reports at
   `https://seismophone.chanmeng.org/observatory/` are the public record; link those.

Record what changed in `CHANGELOG.md` with the measurement behind it, not just the conclusion — the
0.2.1 entry is the model to follow.

## When you change anything

1. `pnpm typecheck`
2. `pnpm test`
3. `pnpm check` (Biome)
4. If you touched `action/src`, rebuild the committed `action/dist` bundle.
5. Don't commit unless asked.
