import type { ClassifiedTags } from './schema.js';

/**
 * Classifies Suno's comma-separated tag string into semantic buckets so the
 * card renderer can style each category differently.
 *
 * Suno's `metadata.tags` is a verbose GPT-elaborated string that mixes
 * genres ("Synthwave"), instruments ("Piano"), moods ("Melancholic"),
 * vocal types ("Female Vocal"), tempo markers ("60 BPM", "Slow"),
 * musical keys ("A minor"), era markers ("80s", "vintage"), production
 * treatments ("live audio", "reverb", "lo-fi"), and occasional free-form
 * creator notes. A minority of clips also expose `metadata.gpt_description_prompt`
 * with the user's original natural-language prompt.
 *
 * The classifier uses substring matching against curated keyword lists,
 * plus two regex-based detectors for tempo (BPM) and era (decade markers).
 * Unknown tags fall into `other` and are still rendered.
 *
 * The classifier was expanded based on empirical audits of real Suno tag data.
 */

const INSTRUMENTS = [
  // Keyboards / pianos
  'piano',
  'keyboard',
  'organ',
  'harpsichord',
  'electric piano',
  'fender rhodes',
  'rhodes',
  'mellotron',
  // Strings
  'guitar',
  'acoustic guitar',
  'electric guitar',
  'bass',
  'bassline',
  'violin',
  'viola',
  'cello',
  'double bass',
  'harp',
  'strings',
  'mandolin',
  'banjo',
  'ukulele',
  'sitar',
  // Winds / brass
  'saxophone',
  'flute',
  'clarinet',
  'oboe',
  'bassoon',
  'trumpet',
  'trombone',
  'french horn',
  'tuba',
  'brass',
  'harmonica',
  'accordion',
  // Drums / percussion
  'drums',
  'drum',
  'drum machine',
  'percussion',
  'xylophone',
  'marimba',
  'glockenspiel',
  'bongo',
  'conga',
  'tabla',
  'handpan',
  'hang drum',
  // Electronic
  'synth',
  'synthesizer',
  'sampler',
  'sequencer',
  '808',
];

const MOODS = [
  // Sad / dark
  'melancholic',
  'melancholy',
  'sad',
  'depressing',
  'mournful',
  'lamenting',
  'wistful',
  'somber',
  'dark',
  'moody',
  'gloomy',
  'brooding',
  'bleak',
  // Happy / uplifting
  'happy',
  'joyful',
  'cheerful',
  'upbeat',
  'uplifting',
  'hopeful',
  'optimistic',
  'feel-good',
  'triumphant',
  // Calm / serene
  'chill',
  'relaxed',
  'calm',
  'peaceful',
  'soothing',
  'meditative',
  'tranquil',
  'ambient',
  // Energetic / aggressive
  'energetic',
  'aggressive',
  'intense',
  'powerful',
  'fierce',
  'angry',
  'driving',
  // Romantic / emotional
  'romantic',
  'emotional',
  'passionate',
  'sensual',
  'soulful',
  // Atmospheric / cinematic
  'ethereal',
  'dreamy',
  'atmospheric',
  'cinematic',
  'epic',
  'dramatic',
  'haunting',
  'eerie',
  'creepy',
  'horror',
  'spooky',
  'mysterious',
  'immersive',
  // Nostalgic / reflective
  'nostalgic',
  'nostalgia',
  'reflective',
  'philosophical',
  'introspective',
  'bittersweet',
  // Playful / quirky
  'anthemic',
  'bright',
  'catchy',
  'groovy',
  'quirky',
  'playful',
  'humorous',
  'humor',
  'ironic',
  'irony',
  'parody',
  'sarcastic',
  'sarcasm',
  'funny',
  'jumpy',
  'bouncy',
  'rhythmic',
  'atmosphere',
  // Sacred / ritual
  'meditative',
  'ritual',
  'shamanic',
  'pagan',
  'worship',
  'sacred',
  'devotional',
  // Surreal
  'psychedelic',
  'hypnotic',
  'trippy',
  'weirdcore',
  'dreamcore',
  'surreal',
];

const VOCALS = [
  'male vocal',
  'female vocal',
  'male voice',
  'female voice',
  'male singer',
  'female singer',
  'deep voice',
  'booming voice',
  'gritty voice',
  'gritty deep vocal',
  'breathy',
  'breathy female',
  'spoken word',
  'choir',
  'chorus',
  'chanting',
  'chants',
  'rap',
  'rapping',
  'whispered',
  'whispering',
  'falsetto',
  'soprano',
  'alto',
  'baritone',
  'tenor',
  'mezzo-soprano',
  'harmonies',
  'harmony',
  'a cappella',
  'acapella',
  'instrumental',
  'vocaloid',
  'utau',
  'clear vocals',
  'soft vocal',
  'layered vocals',
  'layered voice',
  'melismatic',
  'autotune',
  'autotuned',
  'duet',
];

/** Musical keys — e.g. "A minor", "C# dorian", "Bb major". */
const KEY_RE =
  /\b[a-g](?:#|♯|b|♭|♮)?\s*(?:major|minor|maj|min|dorian|phrygian|lydian|mixolydian|aeolian|locrian|ionian|pentatonic|blues)\b/i;
/** Explicit "key: X" prefix. */
const KEY_PREFIX_RE = /^key\s*[:=]/i;

const TEMPO_RE = /\b\d{2,3}\s*bpm\b/i;
const TEMPO_WORDS = [
  'slow',
  'fast',
  'moderate',
  'mid-tempo',
  'midtempo',
  'up-tempo',
  'uptempo',
  'ultra-fast',
  'half-time',
  'double-time',
  'andante',
  'allegro',
  'largo',
  'presto',
];

/**
 * Era markers — decade labels and broader temporal markers. Numeric decades
 * caught via regex, named eras via keyword list.
 */
const ERA_RE = /\b(?:19|20)?\d0s\b/i;
const ERA_WORDS = [
  'vintage',
  'retro',
  'modern',
  'contemporary',
  'old school',
  'oldschool',
  'old-school',
  'classic',
  'golden age',
  'futuristic',
  'futurism',
  'medieval',
  'renaissance',
  'baroque',
  'victorian',
  'prehistoric',
];

/**
 * Production / recording treatment — how the song SOUNDS rather than what
 * genre it is. These tags describe the sonic environment: live recording,
 * tape hiss, stereo width, reverb treatment.
 */
const PRODUCTION = [
  'live',
  'live audio',
  'live recording',
  'studio',
  'studio recording',
  'demo',
  'bootleg',
  'vhs',
  'tape',
  'cassette',
  'vinyl',
  'grainy',
  'concert',
  'audience',
  'stadium',
  'arena',
  'reverb',
  'echo',
  'delay',
  'dry',
  'wet',
  'raw',
  'polished',
  'pristine',
  'clean',
  'muddy',
  'acoustic', // unplugged / no effects
  'unplugged',
  'wide panorama',
  'wide stereo',
  'stereo',
  'mono',
  'lo-fi production',
  'hi-fi',
  'high quality',
  'clear sound',
  'benchmark',
  'gold standard',
  'hq',
  'spatial',
  'immersive audio',
  '3d audio',
  'binaural',
];

const GENRES = [
  // Rock family
  'rock',
  'pop',
  'pop punk',
  'indie',
  'indie rock',
  'indie pop',
  'alternative',
  'alternative rock',
  'grunge',
  'post-rock',
  'post rock',
  'post-hardcore',
  'post hardcore',
  'hardcore',
  'emo',
  'shoegaze',
  'dream pop',
  'new wave',
  'psychedelic rock',
  'progressive rock',
  'prog rock',
  'progressive',
  // Metal
  'metal',
  'heavy metal',
  'death metal',
  'black metal',
  'thrash metal',
  'doom metal',
  'power metal',
  'pagan metal',
  'folk metal',
  // Punk
  'punk',
  'oi',
  'oi punk',
  // Jazz / blues / soul
  'jazz',
  'bebop',
  'swing',
  'blues',
  'soul',
  'neo-soul',
  'funk',
  'motown',
  // Electronic
  'electronic',
  'edm',
  'house',
  'deep house',
  'tech house',
  'progressive house',
  'techno',
  'hard-tech',
  'hardtech',
  'trance',
  'psytrance',
  'dubstep',
  'drum and bass',
  'dnb',
  'liquid dnb',
  'jungle',
  'breakcore',
  'glitch',
  'glitchcore',
  'gitchcore',
  'post-glitch',
  'chiptune',
  'chiptune 8-bit',
  '8-bit',
  'game music',
  'synthwave',
  'vaporwave',
  'chillwave',
  'slushwave',
  'weirdcore',
  'dreamcore',
  'cyberpunk',
  'darkwave',
  'coldwave',
  'industrial',
  'ebm',
  'idm',
  'electro',
  'electro swing',
  'electro-chanson',
  'eurobeat',
  'nrg',
  'hi-nrg',
  'noise',
  'artcore',
  // Urban / dance
  'hip hop',
  'hip-hop',
  'rap',
  'trap',
  'drill',
  'grime',
  'r&b',
  'rnb',
  'disco',
  'house music',
  'dance',
  'dancehall',
  'reggae',
  'reggaeton',
  'ska',
  'dub',
  // Acoustic / folk
  'folk',
  'country',
  'americana',
  'bluegrass',
  'singer-songwriter',
  'songwriter',
  'cantautorale',
  'ballad',
  'chanson',
  // Ambient / experimental
  'ambient',
  'lofi',
  'lo-fi',
  'minimalist',
  'experimental',
  'avant-garde',
  'soundscape',
  'drone',
  'soundtrack',
  'orchestral',
  'classical',
  'opera',
  'operatic',
  'musical',
  // Regional / world
  'anime',
  'j-pop',
  'k-pop',
  'c-pop',
  'mandopop',
  'latin',
  'salsa',
  'bossa nova',
  'flamenco',
  'celtic',
  'african',
  'afrobeat',
  'world',
  'tribal',
  'mariachi',
  'tango',
  'bollywood',
  // Other / niche
  'gospel',
  'christian',
  'alte',
];

/** Strip diacritics from a tag so `flûte` matches `flute`, `café` matches `cafe`. */
function normalize(t: string): string {
  return t
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function matchesAny(tagLower: string, list: readonly string[]): boolean {
  for (const kw of list) {
    if (tagLower.includes(kw)) return true;
  }
  return false;
}

/**
 * Split the comma-separated string from Suno's metadata.tags into trimmed tags.
 *
 * Suno's primary separator is `,` but the round-9 empirical audit (2026-04-12)
 * found a small minority of tag strings use alternate separators:
 *   - `/` in composite tags like `"hip-hop/rap"` (3 of 48 clips in Explore)
 *   - ` -- ` in labels like `"hip-hop -- male vocals"`
 *   - Chinese full-width comma `，` (theoretical — not yet observed in the wild)
 *   - Newlines (1 of 48 clips — a creator pasted a multi-line bio-ish string)
 *
 * We split on all of these so downstream classification sees atomic tags
 * rather than composite strings that fall into the `other` bucket.
 */
export function splitTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,，/\n]|\s--\s/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/**
 * Classify a flat array of Suno tags into 9 named buckets.
 *
 * Ordering rationale:
 *   1. tempo — BPM regex is highly specific, zero false positives
 *   2. key — key-signature regex is specific, won't match other tags
 *   3. era — decade regex + small keyword list, specific
 *   4. vocal — vocal terms are distinctive, low overlap with genre
 *   5. instrument — instrument terms are distinctive
 *   6. genre — genre keywords are broad and should match before
 *      production (so "acoustic rock" → genre, not production)
 *   7. production — production terms like "acoustic" only win when not
 *      overlapped by a genre hit above
 *   8. mood — mood terms are sometimes ambiguous with genre
 *      (e.g. "industrial" can mean either), so check after genre
 *   9. other — unmatched fallback
 */
export function classifyTags(tags: string[]): ClassifiedTags {
  const out: ClassifiedTags = {
    genre: [],
    era: [],
    instrument: [],
    mood: [],
    vocal: [],
    key: [],
    production: [],
    tempo: [],
    other: [],
  };

  for (const raw of tags) {
    const lower = normalize(raw);

    if (TEMPO_RE.test(lower) || matchesAny(lower, TEMPO_WORDS)) {
      out.tempo.push(raw);
      continue;
    }
    if (KEY_RE.test(lower) || KEY_PREFIX_RE.test(lower)) {
      out.key.push(raw);
      continue;
    }
    if (ERA_RE.test(lower) || matchesAny(lower, ERA_WORDS)) {
      out.era.push(raw);
      continue;
    }
    if (matchesAny(lower, VOCALS)) {
      out.vocal.push(raw);
      continue;
    }
    if (matchesAny(lower, INSTRUMENTS)) {
      out.instrument.push(raw);
      continue;
    }
    if (matchesAny(lower, GENRES)) {
      out.genre.push(raw);
      continue;
    }
    if (matchesAny(lower, PRODUCTION)) {
      out.production.push(raw);
      continue;
    }
    if (matchesAny(lower, MOODS)) {
      out.mood.push(raw);
      continue;
    }
    out.other.push(raw);
  }

  return out;
}
