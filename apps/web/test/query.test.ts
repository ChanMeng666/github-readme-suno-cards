import { describe, expect, it } from 'vitest';
import { QueryError, readCardQuery, readCardsQuery, readProfileQuery } from '../lib/query.js';

function p(s: string): URLSearchParams {
  return new URLSearchParams(s);
}

describe('readCardQuery', () => {
  it('throws QueryError on missing id', () => {
    expect(() => readCardQuery(p(''))).toThrow(QueryError);
  });
  it('parses minimal valid query', () => {
    const q = readCardQuery(p('id=some-uuid'));
    expect(q.id).toBe('some-uuid');
    expect(q.theme).toBeUndefined();
  });
  it('recognizes theme', () => {
    expect(readCardQuery(p('id=x&theme=dark')).theme).toBe('dark');
    expect(readCardQuery(p('id=x&theme=light')).theme).toBe('light');
    expect(readCardQuery(p('id=x&theme=auto')).theme).toBe('auto');
  });
  it('drops unknown theme', () => {
    expect(readCardQuery(p('id=x&theme=neon')).theme).toBeUndefined();
  });
  it('coerces booleans', () => {
    const q = readCardQuery(p('id=x&show_plays=false&show_likes=1&show_tags=yes'));
    expect(q.showPlays).toBe(false);
    expect(q.showLikes).toBe(true);
    expect(q.showTags).toBe(true);
  });
  it('clamps width', () => {
    expect(readCardQuery(p('id=x&width=9999')).width).toBe(1200);
    expect(readCardQuery(p('id=x&width=10')).width).toBe(200);
  });
  it('normalizes hex color', () => {
    expect(readCardQuery(p('id=x&bg_color=0a0a0f')).colors.bg).toBe('#0a0a0f');
    expect(readCardQuery(p('id=x&accent_color=%23ff0088')).colors.accent).toBe('#ff0088');
  });
  it('drops invalid hex color', () => {
    expect(readCardQuery(p('id=x&bg_color=notahex')).colors.bg).toBeUndefined();
  });
  it('returns empty colors object when none set', () => {
    expect(readCardQuery(p('id=x')).colors).toEqual({});
  });
});

describe('readProfileQuery', () => {
  it('throws on missing handle', () => {
    expect(() => readProfileQuery(p(''))).toThrow(QueryError);
  });
  it('parses minimal valid query', () => {
    expect(readProfileQuery(p('handle=chanmeng')).handle).toBe('chanmeng');
  });
  it('recognizes lang', () => {
    expect(readProfileQuery(p('handle=x&lang=zh')).lang).toBe('zh');
    expect(readProfileQuery(p('handle=x&lang=xx')).lang).toBeUndefined();
  });
});

describe('readCardsQuery', () => {
  it('parses filters and sort', () => {
    const q = readCardsQuery(
      p(
        'handle=chanmeng&sort=play_count&max=5&include_tags=Synthwave,Ambient&exclude_tags=Instrumental&min_duration=60&min_plays=10',
      ),
    );
    expect(q.handle).toBe('chanmeng');
    expect(q.sort).toBe('play_count');
    expect(q.max).toBe(5);
    expect(q.includeTags).toEqual(['Synthwave', 'Ambient']);
    expect(q.excludeTags).toEqual(['Instrumental']);
    expect(q.minDurationSeconds).toBe(60);
    expect(q.minPlays).toBe(10);
  });
  it('drops invalid sort', () => {
    expect(readCardsQuery(p('handle=x&sort=nonsense')).sort).toBeUndefined();
  });
  it('parses featured csv', () => {
    expect(readCardsQuery(p('handle=x&featured=aaa,bbb,ccc')).featured).toEqual([
      'aaa',
      'bbb',
      'ccc',
    ]);
  });
  it('clamps max into 1..20', () => {
    expect(readCardsQuery(p('handle=x&max=500')).max).toBe(20);
    expect(readCardsQuery(p('handle=x&max=0')).max).toBe(1);
  });
  it('strips empty csv entries', () => {
    expect(readCardsQuery(p('handle=x&include_tags=,,Synthwave,,')).includeTags).toEqual([
      'Synthwave',
    ]);
  });
});
