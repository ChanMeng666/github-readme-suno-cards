import * as v from 'valibot';

// ============================================================================
// Raw API response schemas (what Suno actually sends)
// ============================================================================

/** Colors Suno ships for the model version badge; used to theme the card. */
const ModelBadgeSideSchema = v.object({
  text_color: v.string(),
  background_color: v.string(),
  border_color: v.string(),
});

const ModelBadgesSchema = v.object({
  songrow: v.optional(
    v.object({
      display_name: v.optional(v.string()),
      light: v.optional(ModelBadgeSideSchema),
      dark: v.optional(ModelBadgeSideSchema),
    }),
  ),
});

/**
 * A "secondary badge" — parallel structure to `model_badges.songrow`, ships
 * with each clip when fetched standalone. Observed values for `icon_key`
 * include `"full_song"`.
 */
const SecondaryBadgeSchema = v.object({
  display_name: v.optional(v.string()),
  icon_key: v.optional(v.string()),
  light: v.optional(ModelBadgeSideSchema),
  dark: v.optional(ModelBadgeSideSchema),
});

/**
 * One entry in `metadata.concat_history[]` — for clips of type `"concat"`, the
 * array describes the chain of prior generation steps that were stitched
 * together. Recursive in principle (a concat of concats) but we only model
 * one level because that's all that renders.
 */
const ConcatHistoryEntrySchema = v.object({
  id: v.optional(v.string()),
  type: v.optional(v.string()),
  source: v.optional(v.string()),
  continue_at: v.optional(v.number()),
  infill: v.optional(v.boolean()),
});

/**
 * `metadata.*` sub-object — the most field-diverse area of Suno's API.
 * All fields are optional because the same clip returns different metadata
 * depending on which endpoint serves it (slim vs full shape asymmetry).
 *
 * Approximate field presence rates:
 *   - tags, prompt, duration, type, can_remix, is_remix: ~100%
 *   - stream, refund_credits, priority, make_instrumental: ~69% (standalone-fetch only)
 *   - has_stem, uses_latest_model, model_badges: ~62% ("full" shape only)
 *   - concat_history: 31% (only for type: "concat" clips)
 *   - has_vocal: 16%
 *   - negative_tags: 9%
 *   - gpt_description_prompt: 6% (user's original prompt before GPT expansion)
 *   - edited_clip_id, cover_clip_id, task: 3-5% (cross-author remix pointers)
 *   - secondary_badges, free_quota_category, history, continue_at, infill: 1-2%
 *   - video_upload_{width,height}: <1% (only on upload-type clips)
 */
const ClipMetadataSchema = v.object({
  tags: v.optional(v.nullable(v.string())),
  /**
   * Full lyrics with `[Verse]`/`[Chorus]` structure markers, but ONLY on the
   * "full" /api/clip/{uuid} shape. Playlist-wrapped clips have this field
   * dropped on playlist/trending endpoints.
   */
  prompt: v.optional(v.nullable(v.string())),
  /**
   * The user's **original natural-language prompt** before Suno's GPT layer
   * expanded it into `tags`. When present, this is the raw creator intent
   * (e.g. `"90s R&B, Mando-Pop, Neo-soul, groovy, sophisti-pop, electric
   * piano"`) that got elaborated into the verbose `tags` string. Only a
   * minority of clips expose this — probably those created via a specific
   * Suno workflow that preserves the source prompt.
   */
  gpt_description_prompt: v.optional(v.nullable(v.string())),
  /** Comma-separated short-form tag list (sometimes present alongside `tags`). */
  display_tags: v.optional(v.nullable(v.string())),
  /** Generation-time "avoid these traits" tag list. Example: `"Breathing, whispering, middle east, turkish"`. */
  negative_tags: v.optional(v.nullable(v.string())),
  duration: v.optional(v.nullable(v.number())),

  // Generation flags
  make_instrumental: v.optional(v.boolean()),
  has_vocal: v.optional(v.boolean()),
  can_remix: v.optional(v.boolean()),
  is_remix: v.optional(v.boolean()),
  has_stem: v.optional(v.boolean()),
  uses_latest_model: v.optional(v.boolean()),
  is_mumble: v.optional(v.boolean()),
  can_publish_with_vocal: v.optional(v.boolean()),

  // Generation lifecycle / infra
  /** Server-side task priority integer (observed: 10). Not user-facing. */
  priority: v.optional(v.number()),
  /** Whether the generation supports streaming delivery. */
  stream: v.optional(v.boolean()),
  /** Whether failed generations refunded the creator's credits. */
  refund_credits: v.optional(v.boolean()),
  /** Whether the generated video preview is stale and needs re-rendering. */
  video_is_stale: v.optional(v.boolean()),
  /** Quota bucket label for free-tier users (e.g. credit category). */
  free_quota_category: v.optional(v.nullable(v.string())),
  /**
   * Task type for this clip's generation. Observed values:
   *   - `"cover"` — generated as a cover of another clip
   *   - `"playlist_condition"` — generated conditioned on a playlist context
   * More values likely exist. Different from `type` (which covers 10 creation-method values — see above).
   */
  task: v.optional(v.nullable(v.string())),

  // Lineage pointers — may be redacted (zero UUID) depending on endpoint.
  /** Parent clip for an "edit" operation. Often equal to `cover_clip_id` when both are set. */
  edited_clip_id: v.optional(v.nullable(v.string())),
  /** Parent clip for a "cover" operation. */
  cover_clip_id: v.optional(v.nullable(v.string())),

  // Upload-clip specific (for `type: "upload"`)
  is_audio_upload_tos_accepted: v.optional(v.boolean()),
  video_upload_width: v.optional(v.nullable(v.number())),
  video_upload_height: v.optional(v.nullable(v.number())),

  // Playlist-scoped fields — seen on persona clips that were generated using
  // a playlist as the conditioning context
  /**
   * `playlist_id` — normally a UUID, but can also be the string literal
   * `"inspiration"` (a reserved/special playlist identifier).
   */
  playlist_id: v.optional(v.nullable(v.string())),
  playlist_clip_ids: v.optional(v.array(v.string())),

  /**
   * Clip creation method. Known values:
   *   - `"gen"` — standard prompt-to-song generation
   *   - `"studio_export"` — exported from Suno's Studio DAW
   *   - `"concat"` — stitched/extended via timeline editor
   *   - `"edit_v3_export"` — V3 editor pipeline export
   *   - `"edit_crop"` — audio cropping operation
   *   - `"edit_speed"` — speed adjustment
   *   - `"edit_fade"` — fade in/out
   *   - `"upsample"` — quality upsampling/enhancement
   *   - `"concat_infilling"` — concat with generative infill
   *   - `"upload"` — user-uploaded audio
   */
  type: v.optional(v.string()),
  concat_history: v.optional(v.array(ConcatHistoryEntrySchema)),
  /**
   * A less-documented sibling to `concat_history` — appeared on 2 of 49
   * trending clips. Shape includes an `id` field pointing at another clip.
   * Structure is similar to concat_history but the semantics are unknown.
   */
  history: v.optional(
    v.array(
      v.object({
        id: v.optional(v.string()),
      }),
    ),
  ),
  /**
   * Top-level `continue_at` (in seconds) and `infill` (boolean) are sometimes
   * hoisted from the first concat_history entry to the metadata level. Both
   * appear rarely (~2/49 clips) and only on clips that were extended.
   */
  continue_at: v.optional(v.number()),
  infill: v.optional(v.boolean()),

  // Model badge theming (full shape only)
  model_badges: v.optional(v.nullable(ModelBadgesSchema)),
  secondary_badges: v.optional(v.array(SecondaryBadgeSchema)),
});

/**
 * A single entry in `action_config.actions[]`.
 */
const ActionConfigEntrySchema = v.object({
  /**
   * Action vocabulary (9 values observed across corpus):
   *   - add_to_playlist / remove_from_playlist — playlist management
   *   - like_song / dislike_song — voting
   *   - share_song / report_song — social
   *   - remix_extend — continue the clip with more audio
   *   - remix_cover — use this clip as a cover template
   *   - remix_reuse_style — regenerate using this clip's style tags
   */
  action_type: v.string(),
  disabled: v.optional(v.boolean()),
  visible: v.optional(v.boolean()),
});

const ActionConfigSchema = v.object({
  actions: v.array(ActionConfigEntrySchema),
});

/**
 * Single clip object. Matches multiple response variants:
 *
 *   1. `GET /api/clip/{uuid}`                              → "full" shape
 *   2. `GET /api/profiles/{handle}.clips[]`                → "medium" (adds `is_pinned`, lacks full-only fields)
 *   3. `GET /api/playlist/{uuid}.playlist_clips[].clip`    → "slim" shape
 *   4. `GET /api/trending.playlist_clips[].clip`           → slim variant
 *   5. `GET /api/profiles/{handle}.personas[].clip`        → medium variant
 *
 * The "full" shape additionally carries: `ownership`, `comment_count`,
 * `explicit`, `action_config`, plus these metadata fields:
 * `prompt`, `has_stem`, `uses_latest_model`, `model_badges`, `secondary_badges`.
 *
 * Every asymmetric field is marked `v.optional(...)` so one schema validates
 * all variants.
 */
export const ClipSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  status: v.string(),
  title: v.nullable(v.string()),
  entity_type: v.optional(v.string()), // always "song_schema"
  is_public: v.boolean(),

  // Visibility / state flags (present on all shapes)
  is_trashed: v.optional(v.boolean()),
  is_hidden: v.optional(v.boolean()),
  is_verified: v.optional(v.boolean()),
  is_handle_updated: v.optional(v.boolean()),
  allow_comments: v.optional(v.boolean()),
  /** Whether the clip is flagged as a contest submission. */
  is_contest_clip: v.optional(v.boolean()),
  /** Whether the clip has a dedicated "hook" segment. */
  has_hook: v.optional(v.boolean()),

  // Viewer-relative flags (always false for anonymous requests)
  is_liked: v.optional(v.boolean()),

  // Asymmetric-by-shape
  /** Appears only on `/api/profiles/{handle}.clips[]` (the medium shape). */
  is_pinned: v.optional(v.boolean()),
  /** Appears only on the full shape. */
  is_following_creator: v.optional(v.boolean()),
  /** Appears only on the full shape. */
  explicit: v.optional(v.boolean()),
  /** Appears only on the full shape. */
  comment_count: v.optional(v.number()),
  /** Flag count exposed on every shape. */
  flag_count: v.optional(v.number()),

  // Counters
  play_count: v.number(),
  upvote_count: v.number(),
  /** Integer index within a batch generation (typically 0 unless Suno returned multiple variants). */
  batch_index: v.optional(v.number()),

  // Author attribution
  user_id: v.string(),
  display_name: v.nullable(v.string()),
  handle: v.nullable(v.string()),
  avatar_image_url: v.nullable(v.string()),

  // Media URLs
  image_url: v.string(),
  image_large_url: v.string(),
  audio_url: v.string(),
  video_url: v.optional(v.string()),

  // Model
  /** Short form: `"v3"`, `"v3.5"`, `"v4.5-all"`, `"v5"` etc. */
  major_model_version: v.string(),
  /** Long form: `"chirp-v3"`, `"chirp-auk"`, `"chirp-crow"` (model codename, `chirp-{bird}`). */
  model_name: v.string(),

  created_at: v.string(),
  metadata: ClipMetadataSchema,

  /**
   * `ownership` — present only on the "full" /api/clip/{uuid} shape. Tells
   * the anonymous consumer whether the clip's creator is on a paying plan.
   * Observed values for `ownership_reason`: `"subscribed"`. Other values
   * probably exist (`"free"`, `"trial"`?) — enumerate as we see them.
   */
  ownership: v.optional(
    v.object({
      ownership_reason: v.optional(v.string()),
    }),
  ),

  /**
   * `action_config` — present only on the "full" shape. Describes which UI
   * actions Suno's own web app would render for this clip.
   */
  action_config: v.optional(ActionConfigSchema),
});

export type ClipResponse = v.InferOutput<typeof ClipSchema>;

/**
 * Formal `Persona` schema. Personas are reusable voice/style profiles a
 * creator extracts from a "root" clip.
 */
export const PersonaSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.optional(v.nullable(v.string())),
  /** Image URL (despite the name — not an actual S3 ID). */
  image_s3_id: v.optional(v.nullable(v.string())),
  /** UUID of the clip this persona was derived from. */
  root_clip_id: v.optional(v.string()),

  /** Full embedded clip object. */
  clip: v.optional(ClipSchema),

  // Creator attribution (denormalized from clip.{display_name, handle, avatar_image_url})
  user_display_name: v.optional(v.nullable(v.string())),
  user_handle: v.optional(v.nullable(v.string())),
  user_image_url: v.optional(v.nullable(v.string())),

  /** Usually empty in anonymous responses. */
  persona_clips: v.optional(v.array(v.unknown())),

  /**
   * Persona category. Observed values: `"vox"` (voice profile). Other values
   * (e.g. `"inst"`, `"style"`) may exist but have not been observed.
   */
  persona_type: v.optional(v.string()),
  /** `true` for Suno-provided editorial personas, `false` for user-created. */
  is_suno_persona: v.optional(v.boolean()),

  // State flags
  is_trashed: v.optional(v.boolean()),
  is_hidden: v.optional(v.boolean()),
  is_owned: v.optional(v.boolean()),
  is_public: v.optional(v.boolean()),
  is_public_approved: v.optional(v.boolean()),
  is_loved: v.optional(v.boolean()),
  is_following: v.optional(v.boolean()),

  // Counters
  upvote_count: v.optional(v.number()),
  clip_count: v.optional(v.number()),
  follower_count: v.optional(v.number()),
});

export type PersonaResponse = v.InferOutput<typeof PersonaSchema>;

/**
 * A minimal summary of a playlist as it appears inline in the profile
 * response's `playlists[]` array. This is distinct from `PlaylistDetailSchema`
 * which is returned by `/api/playlist/{uuid}` and has far more fields.
 */
const ProfileInlinePlaylistSchema = v.object({
  id: v.string(),
  name: v.optional(v.nullable(v.string())),
  image_url: v.optional(v.nullable(v.string())),
  num_total_results: v.optional(v.number()),
  is_public: v.optional(v.boolean()),
  is_discover_playlist: v.optional(v.boolean()),
  user_display_name: v.optional(v.nullable(v.string())),
  user_handle: v.optional(v.nullable(v.string())),
  user_avatar_image_url: v.optional(v.nullable(v.string())),
  user_is_verified: v.optional(v.boolean()),
  entity_type: v.optional(v.string()),
  description: v.optional(v.nullable(v.string())),
  upvote_count: v.optional(v.number()),
  dislike_count: v.optional(v.number()),
  flag_count: v.optional(v.number()),
  play_count: v.optional(v.number()),
  song_count: v.optional(v.number()),
  skip_count: v.optional(v.number()),
  total_duration: v.optional(v.number()),
  is_owned: v.optional(v.boolean()),
  is_trashed: v.optional(v.boolean()),
  is_hidden: v.optional(v.boolean()),
  current_page: v.optional(v.number()),
  playlist_clips: v.optional(v.array(v.unknown())),
});

/**
 * `/api/profiles/{handle}?clips_sort_by=X&playlists_sort_by=X&page=N` response.
 *
 * Declares all known top-level fields. Viewer-relative fields are always
 * false for anonymous requests but are declared for completeness.
 */
export const ProfileResponseSchema = v.object({
  // Identity
  user_id: v.string(),
  handle: v.string(),
  display_name: v.nullable(v.string()),
  profile_description: v.optional(v.nullable(v.string())),
  avatar_image_url: v.nullable(v.string()),
  is_verified: v.optional(v.boolean()),

  // Counters + pagination
  num_total_clips: v.number(),
  current_page: v.optional(v.number()),

  /**
   * Stats sum object. Suno only populates on page 1; on pages 2+ this
   * comes back as `{}`. Every field is optional so validation succeeds.
   */
  stats: v.object({
    upvote_count__sum: v.optional(v.number()),
    play_count__sum: v.optional(v.number()),
    followers_count: v.optional(v.number()),
    following_count: v.optional(v.number()),
  }),

  // Content arrays
  clips: v.array(ClipSchema),
  playlists: v.array(ProfileInlinePlaylistSchema),
  /** Typically empty for anonymous requests. */
  favorite_songs: v.optional(v.array(ClipSchema)),
  /** Reusable voice/style profiles. See PersonaSchema. */
  personas: v.optional(v.array(PersonaSchema)),

  // Viewer-relative flags — always false for anonymous requests but Suno
  // still sends them. Declared for self-documentation.
  is_flagged: v.optional(v.boolean()),
  is_following: v.optional(v.boolean()),
  is_contact: v.optional(v.boolean()),
  viewer_is_blocking_profile: v.optional(v.boolean()),
  viewer_is_blocked_by_profile: v.optional(v.boolean()),
  viewer_is_hiding_creator_hook: v.optional(v.boolean()),
  viewer_is_hiding_creator_clip: v.optional(v.boolean()),
  user_comments_blocked: v.optional(v.boolean()),

  // Feature flags (owner-side)
  /** Whether artist profiles are enabled for this user. */
  artist_profiles_enabled: v.optional(v.boolean()),
  /** V2 profiles feature flag. */
  profiles_v2_enabled: v.optional(v.boolean()),
});

export type ProfileResponse = v.InferOutput<typeof ProfileResponseSchema>;

/** /api/oembed?url=... response (W3C oEmbed rich type). */
export const OEmbedResponseSchema = v.object({
  version: v.optional(v.string()),
  type: v.optional(v.string()),
  provider_name: v.optional(v.string()),
  provider_url: v.optional(v.string()),
  title: v.string(),
  html: v.optional(v.string()),
  iframe_url: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  thumbnail_url: v.optional(v.string()),
  author_name: v.optional(v.string()),
});

export type OEmbedResponse = v.InferOutput<typeof OEmbedResponseSchema>;

/**
 * Wrapper Suno uses around each clip inside a playlist's `playlist_clips`
 * array. `relative_index` is 1-based within the playlist (0-based for the
 * Explore/trending playlist — see schema test).
 */
export const PlaylistClipWrapperSchema = v.object({
  clip: ClipSchema,
  relative_index: v.number(),
});

/**
 * Full playlist detail as returned by both:
 *   - /api/playlist/{uuid}           → user-owned playlist ("Chan's Creation")
 *   - /api/trending                  → curated editorial playlist ("Explore")
 *
 * The two share this shape exactly; the user-playlist variant additionally
 * carries `user_display_name`/`user_handle`/`user_avatar_image_url`/
 * `user_is_verified` + an opaque `next_cursor` when more pages exist. All
 * user-* fields are optional because the trending variant lacks them.
 *
 * Pagination: `?page=N` (1-indexed). **Page size is 50** here — different
 * from /api/profiles/ which returns 20 per page.
 */
export const PlaylistDetailSchema = v.object({
  id: v.string(),
  entity_type: v.optional(v.string()),
  name: v.nullable(v.string()),
  description: v.optional(v.nullable(v.string())),
  image_url: v.optional(v.nullable(v.string())),
  is_public: v.optional(v.boolean()),
  is_trashed: v.optional(v.boolean()),
  is_hidden: v.optional(v.boolean()),
  is_discover_playlist: v.optional(v.boolean()),
  num_total_results: v.number(),
  current_page: v.optional(v.number()),
  song_count: v.optional(v.number()),
  total_duration: v.optional(v.number()),
  upvote_count: v.optional(v.number()),
  dislike_count: v.optional(v.number()),
  flag_count: v.optional(v.number()),
  play_count: v.optional(v.number()),
  skip_count: v.optional(v.number()),
  playlist_clips: v.array(PlaylistClipWrapperSchema),
  // User-owned playlists only:
  user_display_name: v.optional(v.nullable(v.string())),
  user_handle: v.optional(v.nullable(v.string())),
  user_avatar_image_url: v.optional(v.nullable(v.string())),
  user_is_verified: v.optional(v.boolean()),
  // Cursor for cursor-style pagination (base64-encoded JSON); undefined on
  // last page. We use `?page=N` instead but keep it in the schema so the
  // Valibot parse succeeds when it's present.
  next_cursor: v.optional(v.nullable(v.string())),
});

export type PlaylistDetailResponse = v.InferOutput<typeof PlaylistDetailSchema>;

// ============================================================================
// Normalized output types (what `fetchSong` / `fetchProfile` return)
// ============================================================================

export type SortKey = 'created_at' | 'upvote_count' | 'play_count' | 'name';

export type ClipStatus = 'complete' | 'streaming' | 'submitted' | 'queued' | 'error';

/**
 * Buckets that `tags.ts::classifyTags` sorts Suno's flat tag list into.
 *
 * 9 buckets total, expanded iteratively based on empirical tag audits.
 *
 * Bucket semantics:
 *   - `genre`       — musical genre or sub-genre ("Synthwave", "Grunge")
 *   - `era`         — decade/era markers ("80s", "vintage", "2000s")
 *   - `mood`        — emotional tone ("Melancholic", "Uplifting")
 *   - `vocal`       — vocal type or style ("Female Vocal", "Deep Voice")
 *   - `instrument`  — prominent instrument ("Piano", "Accordion")
 *   - `key`         — musical key signature ("A minor", "C# dorian")
 *   - `production`  — recording / mix treatment ("Live audio", "Tape", "Reverb")
 *   - `tempo`       — tempo markers ("60 BPM", "Slow")
 *   - `other`       — didn't match any of the above keyword lists
 */
export type ClassifiedTags = {
  genre: string[];
  era: string[];
  instrument: string[];
  mood: string[];
  vocal: string[];
  key: string[];
  production: string[];
  tempo: string[];
  other: string[];
};

export type BadgeTheme = {
  text: string;
  bg: string;
  border: string;
};

export type SunoSong = {
  id: string;
  title: string;
  status: ClipStatus;
  isPublic: boolean;
  isPinned: boolean;
  explicit: boolean;
  author: {
    displayName: string;
    handle: string | null;
    avatarUrl: string | null;
    userId: string;
  };
  coverUrl: string;
  coverLargeUrl: string;
  audioUrl: string;
  videoUrl: string | null;
  tags: string[];
  classifiedTags: ClassifiedTags;
  lyrics: string | null;
  durationSeconds: number;
  playCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isNew: boolean;
  modelVersion: string;
  modelName: string;
  modelBadgeTheme: {
    light: BadgeTheme;
    dark: BadgeTheme;
  } | null;
  shareUrl: string;
  embedUrl: string;
  source: 'clip' | 'profile' | 'oembed' | 'playlist' | 'trending';
};

export type SunoPlaylist = {
  id: string;
  name: string;
  imageUrl: string | null;
  numTracks: number;
  isPublic: boolean;
};

/**
 * Normalized playlist-with-tracks result, used by both `fetchPlaylist(uuid)`
 * and `fetchTrending()`. `clips` is ordered by Suno's own `relative_index`
 * (ascending) so the first element is position 1 in the playlist.
 */
export type SunoPlaylistDetail = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  isDiscover: boolean;
  numTotalTracks: number;
  currentPage: number;
  clips: SunoSong[];
  owner: {
    displayName: string;
    handle: string | null;
    avatarUrl: string | null;
  } | null;
  shareUrl: string | null;
  source: 'playlist' | 'trending';
};

export type SunoProfile = {
  userId: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  description: string;
  isVerified: boolean;
  totalClips: number;
  stats: {
    totalPlays: number;
    totalLikes: number;
    followers: number;
    following: number;
  };
  playlists: SunoPlaylist[];
  shareUrl: string;
};
