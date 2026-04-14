/**
 * Render a small chain-link icon as pure SVG paths.
 * Uses the Lucide "link" icon geometry scaled to `size`.
 */
export function renderLinkIcon(x: number, y: number, size = 14): string {
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" class="link-icon" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>`;
}
