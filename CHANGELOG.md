# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-16

### Added
- Standard community-health documentation (`CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, `GOVERNANCE.md`, this changelog).
- Parser: clip-level `caption`, `display_tags`, `preview_url`, `video_cover_url`, `hook_preview_thumbnail_url`, `download_disabled_reason`, `is_contest_base_clip`, `is_persona_root` and `albums`, plus `metadata.persona_id`. All optional — presence varies by response shape.
- `albums` is modelled as `v.optional(v.array(v.unknown()))` on purpose: it is present on every clip on every endpoint we read, and empty on all of them (0 non-empty of 101 clips across the fixtures, measured 2026-08-16). The element shape is unobserved, so it is not invented.
- Test: the archived `fixtures/trending.json` capture is still asserted to parse under `PlaylistDetailSchema`.

### Changed
- **Breaking-ish:** `fetchPlaylistDetailUrl` now maps HTTP `422` to `SunoInvalidRequestError` instead of `SunoHandleNotFoundError`. A 422 means Suno rejected the request shape, not that the playlist is missing; `profile.ts` already did this.
- The parser sends one honest, self-identifying `User-Agent` (`github-readme-suno-cards/0.2.0 (+https://github.com/ChanMeng666/github-readme-suno-cards)`) instead of rotating five browser strings. Suno's public API does not gate on User-Agent, so there was nothing to gain by looking like a browser.
- `SunoSong['source']` and `SunoPlaylistDetail['source']` keep the `'trending'` literal, now documented as **deprecated**. No fetcher emits it; it will be dropped in the next major.
- Test fixtures refreshed 2026-08-16 (clip, profile page 1 and 2, playlist, oEmbed).
- Assertions that were pinned to live Suno counters (play totals, clip totals, the top song's play count) now derive their expected value from the fixture, so a counter tick can no longer fail the suite for a non-schema reason.

### Removed
- `fetchTrending()`. Suno removed the `/api/trending` route on 2026-07-24. The playlist object that route aliased is still public and still returns 200, so it stays reachable as an ordinary playlist: `fetchPlaylist('1190bf92-10dc-4ce5-968a-7a377f37f984')`. Its membership has been frozen since September 2024 while the per-clip statistics still move — a historical exhibit, not a feed. The function was never exported from the package index, so this is not a breaking change for consumers of `@suno-cards/parser`.

### Fixed
- `display_tags` was declared on `ClipMetadataSchema`, but Suno sends it at the clip top level — Valibot was silently discarding it. It now lives on `ClipSchema`.
- Corrected two shape claims in the schema comments, measured 2026-08-16: `model_badges` / `secondary_badges` are not full-shape-only (they are on the editorial-shelf shape — `model_badges` 18/22 on Staff Picks and 23/23 on "Best of v5.5"; secondary badges 12/22 and 11/23), and `is_following_creator` / `explicit` / `comment_count` are present on the full, medium and shelf shapes, absent only from the slim/oEmbed shape.

### Docs
- README: the `/api/trending` note now says what actually happened — the **route** was removed on 2026-07-24, the **object** is still public and returns 200, its membership has been frozen since September 2024, and its statistics are live.

## [0.0.0]

### Added
- Initial documented release of Github Readme Suno Cards.
