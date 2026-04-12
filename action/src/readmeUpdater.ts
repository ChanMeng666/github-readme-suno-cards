import { readFileSync, writeFileSync } from 'node:fs';

/**
 * Replace the content between HTML comment markers in a README file.
 *
 * Markers take the shape:
 *   <!-- SUNO-CARDS:START -->
 *   ...anything... (will be replaced)
 *   <!-- SUNO-CARDS:END -->
 *
 * The marker name is configurable so users can embed multiple independent
 * instances of this Action in one README.
 */

export type UpdateReadmeOptions = {
  readmePath: string;
  commentTagName: string;
  replacement: string;
};

export type UpdateReadmeResult = {
  changed: boolean;
  original: string;
  updated: string;
};

export class MarkersNotFoundError extends Error {
  constructor(public readonly tag: string) {
    super(`Could not find <!-- ${tag}:START --> / <!-- ${tag}:END --> markers in README`);
  }
}

export function updateReadmeContent(
  source: string,
  commentTagName: string,
  replacement: string,
): string {
  const tag = escapeRegExp(commentTagName);
  const pattern = new RegExp(
    `(<!--\\s*${tag}:START\\s*-->)([\\s\\S]*?)(<!--\\s*${tag}:END\\s*-->)`,
    'm',
  );
  if (!pattern.test(source)) {
    throw new MarkersNotFoundError(commentTagName);
  }
  return source.replace(pattern, `$1\n${replacement}\n$3`);
}

export function updateReadmeFile(opts: UpdateReadmeOptions): UpdateReadmeResult {
  const original = readFileSync(opts.readmePath, 'utf-8');
  const updated = updateReadmeContent(original, opts.commentTagName, opts.replacement);
  const changed = original !== updated;
  if (changed) writeFileSync(opts.readmePath, updated, 'utf-8');
  return { changed, original, updated };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
