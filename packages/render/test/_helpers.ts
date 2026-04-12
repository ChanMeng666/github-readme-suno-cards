import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ClipSchema, ProfileResponseSchema } from '@suno-cards/parser';
import * as v from 'valibot';

/** Resolve a fixture from the parser package's test/fixtures directory. */
const PARSER_FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'parser',
  'test',
  'fixtures',
);

export function loadParserFixture<T = unknown>(name: string): T {
  return JSON.parse(readFileSync(join(PARSER_FIXTURES, name), 'utf-8')) as T;
}

/** Parse the real clip fixture through the parser's schema for a type-safe test value. */
export function loadClipResponse() {
  const raw = loadParserFixture('clip-complete.json');
  const result = v.safeParse(ClipSchema, raw);
  if (!result.success) throw new Error('clip fixture failed schema');
  return result.output;
}

export function loadProfileResponse() {
  const raw = loadParserFixture('profile-page1.json');
  const result = v.safeParse(ProfileResponseSchema, raw);
  if (!result.success) throw new Error('profile fixture failed schema');
  return result.output;
}
