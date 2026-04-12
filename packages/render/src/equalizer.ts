/**
 * Spotify-style animated equalizer overlay.
 *
 * Rendered as a `<foreignObject>` with HTML `<div>`s instead of native SVG
 * rects. This matches the approach `spotify-github-profile` uses and avoids
 * the SVG `transform-box` / `transform-origin` quirk where `scaleY` with
 * `transform-origin: center bottom` is interpreted relative to the root
 * viewBox instead of the element's own bounding box — which made our earlier
 * pure-SVG bars overflow the backing rectangle vertically.
 *
 * In the HTML/flex layout the bars are children of a flex container with
 * `align-items: flex-end`, so they always grow upward from the container
 * bottom; animating `height` in percent keeps them strictly within bounds.
 */
export type EqualizerOptions = {
  /** X/Y of the backing rectangle's top-left corner in the parent SVG. */
  x: number;
  y: number;
  /** Outer width of the backing rectangle. */
  width?: number;
  /** Outer height of the backing rectangle. */
  height?: number;
  /** Number of bars. Animation stagger is only tuned for 4. */
  bars?: number;
};

export function renderEqualizer(opts: EqualizerOptions): string {
  const { x, y, width = 36, height = 32, bars = 4 } = opts;
  const spans = Array.from(
    { length: bars },
    (_, i) => `<span class="eq-bar eq-bar-${i + 1}"></span>`,
  ).join('');
  return `<foreignObject class="equalizer" x="${x}" y="${y}" width="${width}" height="${height}" aria-hidden="true">
    <div xmlns="http://www.w3.org/1999/xhtml" class="eq-wrap">${spans}</div>
  </foreignObject>`;
}
