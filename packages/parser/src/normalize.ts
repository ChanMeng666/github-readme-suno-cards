import { SunoInvalidInputError } from './errors.js';

/** A canonical v4 UUID as used by Suno for song IDs. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_IN_URL_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** A Suno share short code, e.g. Fgjo6R52kPsRs16o. Alphanumeric, ~12-20 chars. */
const SHORT_CODE_RE = /^[A-Za-z0-9]{6,24}$/;

/** A Suno handle, e.g. chanmeng. Alphanumeric + underscore + hyphen, 2-30 chars. */
const HANDLE_RE = /^[A-Za-z0-9_.-]{2,30}$/;

export type NormalizedInput =
  | { kind: 'uuid'; uuid: string }
  | { kind: 'playlistUuid'; uuid: string }
  | { kind: 'shortCode'; shortCode: string }
  | { kind: 'handle'; handle: string };

/**
 * Classify a raw input string into one of four forms. Does not perform any
 * network calls — short codes and handles are returned as-is, the caller is
 * responsible for resolving short codes via `resolver.ts`.
 *
 * Accepted inputs:
 *   - Bare UUID              "a885e43c-6918-456f-a5f0-0e8e29e61066"  (defaults to clip kind — bare UUIDs are always routed to /api/clip/; paste the full URL to disambiguate playlists)
 *   - Song page URL          "https://suno.com/song/<uuid>"        (query params ok)
 *   - Embed URL              "https://suno.com/embed/<uuid>"
 *   - **Playlist page URL**  "https://suno.com/playlist/<uuid>"
 *   - Short share URL        "https://suno.com/s/<shortcode>"
 *   - Bare short code        "Fgjo6R52kPsRs16o"
 *   - Handle URL             "https://suno.com/@<handle>"
 *   - Bare handle            "chanmeng" or "@chanmeng"
 *
 * Each endpoint only accepts its own ID namespace: /api/clip only clip UUIDs,
 * /api/playlist only playlist UUIDs (plus the stable trending UUID),
 * /api/profiles handles only.
 * That means a **bare UUID string** is genuinely ambiguous (could be a clip or
 * playlist) — we resolve that ambiguity by defaulting to clip, because clip is
 * what 99% of share links are. Pasting the full `suno.com/playlist/<uuid>` URL
 * is the only way to force the playlist interpretation.
 */
export function normalizeInput(rawInput: string): NormalizedInput {
  if (typeof rawInput !== 'string') {
    throw new SunoInvalidInputError(String(rawInput));
  }
  const input = rawInput.trim();
  if (input === '') throw new SunoInvalidInputError(input);

  // 1. Bare UUID
  if (UUID_RE.test(input)) {
    return { kind: 'uuid', uuid: input.toLowerCase() };
  }

  // 2. Any URL from suno.com
  let url: URL | null = null;
  try {
    url = new URL(input);
  } catch {
    // not a URL, fall through
  }

  if (url && /(^|\.)suno\.com$/i.test(url.hostname)) {
    // /song/{uuid} or /embed/{uuid}
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments[0] === 'song' || segments[0] === 'embed') {
      const candidate = segments[1] ?? '';
      const match = candidate.match(UUID_IN_URL_RE);
      if (match) return { kind: 'uuid', uuid: match[0].toLowerCase() };
    }
    // /playlist/{uuid}
    if (segments[0] === 'playlist') {
      const candidate = segments[1] ?? '';
      const match = candidate.match(UUID_IN_URL_RE);
      if (match) return { kind: 'playlistUuid', uuid: match[0].toLowerCase() };
    }
    // /s/{shortCode}
    if (segments[0] === 's' && segments[1]) {
      return { kind: 'shortCode', shortCode: segments[1] };
    }
    // /@{handle}
    if (segments[0]?.startsWith('@')) {
      const handle = segments[0].slice(1);
      if (HANDLE_RE.test(handle)) return { kind: 'handle', handle };
    }
    // Fallback: any UUID-shaped substring in the path. We default to clip
    // because 99% of share links point at songs, not playlists.
    const embeddedUuid = url.pathname.match(UUID_IN_URL_RE);
    if (embeddedUuid) return { kind: 'uuid', uuid: embeddedUuid[0].toLowerCase() };
  }

  // 3. Leading @ → handle
  if (input.startsWith('@')) {
    const handle = input.slice(1);
    if (HANDLE_RE.test(handle)) return { kind: 'handle', handle };
  }

  // 4. Plain bare short code
  if (SHORT_CODE_RE.test(input) && /[A-Z]/.test(input) && /[a-z]/.test(input)) {
    // Heuristic: short codes mix upper+lower case. Handles are usually all lowercase.
    return { kind: 'shortCode', shortCode: input };
  }

  // 5. Handle
  if (HANDLE_RE.test(input)) {
    return { kind: 'handle', handle: input };
  }

  throw new SunoInvalidInputError(input);
}
