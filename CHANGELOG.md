# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **`media_urls` on the clip schema.** Suno now attaches a per-clip delivery manifest to every clip on every endpoint (present on 149 of 149 clips sampled 2026-08-24), listing two audio tiers: the familiar `mp3` on `cdn1.suno.ai` and an `m4a-opus` tier on a separate host. Modelled with every field optional, like the rest of the clip shape.
- **`resizeSunoCover()`, exported from `@suno-cards/parser`.** Suno's cover CDN accepts `?width=N` only for `{100, 256, 360, 720}` — any other number is a **403**, not a smaller image — so this snaps a requested size up to the nearest allowed one and passes non-Suno URLs through untouched. Now applied on every cover and avatar fetch in the web service and the Action: cards draw covers at ~120px and avatars at 60px, and until now every cold render downloaded the full-size original.
- **`editorial-shelf.json` test fixture** — a trimmed capture of Suno's live curated Explore shelf, kept because it is the one place Suno ships a genuinely heterogeneous clip array. It carries one clip per distinct shape combination, so the tests assert *kinds* rather than counts.

### Fixed
- **Corrected: the clips without `model_badges` are not "human uploads".** An earlier note said absence tracked `metadata.type: "upload"`. A later sample falsified it — 8 of 22 shelf clips lacked the badge: 6 `upload` **and 2 `studio_export`**. The explanation was right ("nothing generated them"), the predicate was wrong. The invariant is the absence of a generating model (`model_name: "chirp-chirp"` with an empty `major_model_version`), and the tests now assert that rather than the proxy, so a new no-model `type` passes instead of breaking.
- **Corrected: `secondary_badges` absence is a property of the clip, not of the response shape.** The previous note framed it as a shape/UA rule. Presence tracks whether the clip actually carries a badge; the User-Agent prefix rule is a separate, additional effect, and both are now documented on the field.
- **Two asset-fetch User-Agents pointed at the wrong GitHub org** (`chanmeng` rather than `ChanMeng666`), so the `+` URL a curious server operator would follow returned a 404. Both now use one project-identifying string kept in step with the parser's.
- Dropped a stale "Known Issues" entry from `CONTRIBUTING.md`: `playlist.ts` already maps HTTP `422` to `SunoInvalidRequestError` (fixed in 0.2.0).

### Notes
- **Do not build a player on the `m4a-opus` tier — use `audio_url`.** Measured 2026-08-24 in Chrome 148: `canPlayType("audio/mp4; codecs=opus")` returns `"probably"`, so the codec is not the obstacle, yet the payload fails with `MediaError.code = 4` both from its URL and re-wrapped whole in a correctly-typed Blob; the first 4 KB of three clips from three different years carried no `ftyp`/`moov`/`mdat`/`OggS`/`OpusHead`/`ID3`/`fLaC`/`RIFF`/`EBML` marker, shared no opening bytes, and measured 7.949–7.962 bits per byte of entropy against a maximum of 8. `content_type` is Suno's label; we did not verify it, and we did not attempt to decode the payload. A two-`<source>` list with the opus tier first is worse than useless — the browser selects it confidently and fails every time.

## [0.2.1] - 2026-08-16

### Fixed
- **0.2.0 claimed "Suno's public API does not gate on User-Agent". That is wrong.** Suno does not *block* on User-Agent, but it does *vary the response shape* by one: a User-Agent beginning with `suno` (case-insensitive) receives a variant with `metadata.secondary_badges` omitted on every clip. Measured 2026-08-16 over 20 anonymous GETs of one editorial-shelf playlist (n=22 clips each time, `cf-cache-status: DYNAMIC`, so origin responses rather than cache artefacts): `suno`-prefixed User-Agents got `secondary_badges` on 0 of 22 clips; every other User-Agent tried — real browsers, `curl/8.0`, `Googlebot/2.1`, and this project's own string — got it on 12 of 22. Nothing else in the payload differed. Inferred, not confirmed: the server treats a `suno`-prefixed User-Agent as one of Suno's own native clients and serves that client's serializer variant.
- No behaviour change in this release: the parser's User-Agent does not begin with `suno`, so 0.2.0 was already receiving the ordinary variant. This corrects the claim, documents the measurement in `fetcher.ts`, adds the presence caveat to the `secondary_badges` declaration in `schema.ts`, and warns anyone renaming the User-Agent to keep the `suno` prefix free.

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
