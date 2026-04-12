import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

/**
 * Schema of an entry in `suno-songs.yml`:
 *   - id: "<uuid | short URL | song URL>"
 *     (optional) featured: true
 */
export type ManifestEntry = {
  id: string;
  featured?: boolean;
};

export type Manifest = {
  songs: ManifestEntry[];
};

/**
 * Load a YAML manifest file at `path` and return a normalized list of
 * song identifiers. Accepts multiple input shapes for maximum ergonomics:
 *
 * Shape A — plain list of IDs:
 *   - a885e43c-6918-...
 *   - https://suno.com/song/abc-def...
 *
 * Shape B — list of objects:
 *   - id: a885e43c-6918-...
 *     featured: true
 *
 * Shape C — top-level { songs: [...] } with either A or B nested.
 */
export function loadManifest(path: string): Manifest {
  const raw = readFileSync(path, 'utf-8');
  const doc: unknown = parseYaml(raw);
  return normalizeManifest(doc);
}

export function normalizeManifest(doc: unknown): Manifest {
  // Shape C: { songs: [...] }
  if (doc && typeof doc === 'object' && 'songs' in doc) {
    const inner = (doc as { songs: unknown }).songs;
    return { songs: coerceEntries(inner) };
  }
  // Shape A / B: top-level list
  if (Array.isArray(doc)) {
    return { songs: coerceEntries(doc) };
  }
  return { songs: [] };
}

function coerceEntries(value: unknown): ManifestEntry[] {
  if (!Array.isArray(value)) return [];
  const out: ManifestEntry[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed) out.push({ id: trimmed });
      continue;
    }
    if (item && typeof item === 'object' && 'id' in item) {
      const id = String((item as { id: unknown }).id ?? '').trim();
      if (!id) continue;
      const entry: ManifestEntry = { id };
      if ('featured' in item) {
        entry.featured = Boolean((item as { featured?: unknown }).featured);
      }
      out.push(entry);
    }
  }
  return out;
}
