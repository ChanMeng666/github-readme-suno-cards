/**
 * Tiny inline SVG icons used inside <foreignObject> stat rows.
 * Each returns an `<svg>` snippet at the given pixel size.
 */

export function iconPlay(size = 10): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M5 3.5v9a.5.5 0 0 0 .77.42l7-4.5a.5.5 0 0 0 0-.84l-7-4.5A.5.5 0 0 0 5 3.5Z"/></svg>`;
}

export function iconHeart(size = 10): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 14s-5.5-3.5-5.5-7.5A3 3 0 0 1 8 4a3 3 0 0 1 5.5 2.5C13.5 10.5 8 14 8 14Z"/></svg>`;
}

export function iconClock(size = 10): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>`;
}

export function iconUser(size = 10): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="5.5" r="3"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>`;
}

export function iconMusic(size = 10): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M13 2.5 6 4v7.3A2.5 2.5 0 1 0 7.5 13.5V6l4-.9v4.2A2.5 2.5 0 1 0 13 12.5V2.5Z"/></svg>`;
}
