import { describe, expect, it } from 'vitest';
import { classifyTags, splitTags } from '../src/tags.js';

describe('splitTags', () => {
  it('splits real Suno tag string', () => {
    const result = splitTags(
      'Minimalist Piano, Ambient, Spoken Word, Melancholic, Deep Voice, Reverb, Slow, 60 BPM, Philosophical, Ethereal',
    );
    expect(result).toEqual([
      'Minimalist Piano',
      'Ambient',
      'Spoken Word',
      'Melancholic',
      'Deep Voice',
      'Reverb',
      'Slow',
      '60 BPM',
      'Philosophical',
      'Ethereal',
    ]);
  });

  it('handles null/undefined/empty', () => {
    expect(splitTags(null)).toEqual([]);
    expect(splitTags(undefined)).toEqual([]);
    expect(splitTags('')).toEqual([]);
  });

  it('accepts Chinese comma', () => {
    expect(splitTags('Piano，Ambient')).toEqual(['Piano', 'Ambient']);
  });
});

describe('classifyTags', () => {
  it('categorizes the real fixture tags correctly', () => {
    const tags = splitTags(
      'Minimalist Piano, Ambient, Spoken Word, Melancholic, Deep Voice, Reverb, Slow, 60 BPM, Philosophical, Ethereal',
    );
    const c = classifyTags(tags);

    expect(c.instrument).toContain('Minimalist Piano');
    expect(c.genre).toContain('Ambient');
    expect(c.vocal).toEqual(expect.arrayContaining(['Spoken Word', 'Deep Voice']));
    expect(c.mood).toEqual(expect.arrayContaining(['Melancholic', 'Philosophical', 'Ethereal']));
    expect(c.tempo).toEqual(expect.arrayContaining(['Slow', '60 BPM']));
    // 'Reverb' is classified as a production treatment.
    expect(c.production).toContain('Reverb');
  });

  it('returns empty buckets for empty input', () => {
    const c = classifyTags([]);
    expect(c.genre).toEqual([]);
    expect(c.era).toEqual([]);
    expect(c.instrument).toEqual([]);
    expect(c.mood).toEqual([]);
    expect(c.vocal).toEqual([]);
    expect(c.key).toEqual([]);
    expect(c.production).toEqual([]);
    expect(c.tempo).toEqual([]);
    expect(c.other).toEqual([]);
  });

  it('recognizes BPM pattern', () => {
    const c = classifyTags(['120 BPM']);
    expect(c.tempo).toEqual(['120 BPM']);
  });

  // Additional taxonomy buckets
  it('recognizes musical key signatures in the key bucket', () => {
    const c = classifyTags(['A minor', 'C# dorian', 'Bb major', 'F lydian']);
    expect(c.key).toEqual(expect.arrayContaining(['A minor', 'C# dorian', 'Bb major', 'F lydian']));
  });

  it('recognizes decade markers in the era bucket', () => {
    const c = classifyTags(['80s', '1990s', '2000s', 'vintage', 'retro']);
    expect(c.era).toEqual(expect.arrayContaining(['80s', '1990s', '2000s', 'vintage', 'retro']));
  });

  it('recognizes production / recording-treatment tags', () => {
    const c = classifyTags(['Live Audio', 'Bootleg', 'VHS', 'Tape', 'Wide Panorama']);
    expect(c.production).toEqual(
      expect.arrayContaining(['Live Audio', 'Bootleg', 'VHS', 'Tape', 'Wide Panorama']),
    );
  });

  it('normalizes accented characters so flûte matches flute', () => {
    const c = classifyTags(['flûte', 'café']);
    expect(c.instrument).toContain('flûte');
    // café has no matching bucket; should land in other
    expect(c.other).toContain('café');
  });

  it('genre wins over production for composite tags like "acoustic rock"', () => {
    const c = classifyTags(['acoustic rock', 'acoustic']);
    // "acoustic rock" contains "rock" (genre) and "acoustic" (production) —
    // genre checked first wins
    expect(c.genre).toContain('acoustic rock');
    // bare "acoustic" falls to production
    expect(c.production).toContain('acoustic');
  });

  it('classifies extended genre keywords', () => {
    const c = classifyTags([
      'Electro Swing',
      'Chiptune',
      'Game Music',
      'Post-Hardcore',
      'Grunge',
      'Jungle',
      'Dancehall',
      'Grime',
      'Cantautorale',
      'New Wave',
      'Orchestral',
      'Avant-Garde',
      'Tribal',
    ]);
    // All should land in genre (none in other)
    expect(c.other).toEqual([]);
    expect(c.genre.length).toBe(13);
  });
});
