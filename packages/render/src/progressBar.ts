import { escapeXml } from './escape.js';
import { formatDuration } from './format.js';

export type ProgressBarOptions = {
  /** X position of the play button center. */
  x: number;
  /** Y position (vertical center of the bar row). */
  y: number;
  /** Total available width from x to right edge. */
  width: number;
  /** Song duration in seconds. */
  durationSeconds: number;
  /** Fraction of the song that has been "played" (0–1). Default 0.39. */
  progressFraction?: number;
};

const PLAY_RADIUS = 18;
const SCRUBBER_RADIUS = 6;
const TRACK_HEIGHT = 4;

/**
 * Render a player-style progress bar group: play button + elapsed time +
 * track + scrubber + total time. All pure SVG elements.
 */
export function renderProgressBar(opts: ProgressBarOptions): string {
  const { x, y, width, durationSeconds } = opts;
  const fraction = Math.max(0, Math.min(1, opts.progressFraction ?? 0.39));

  const totalLabel = formatDuration(durationSeconds);
  const elapsedSeconds = Math.round(fraction * durationSeconds);
  const elapsedLabel = formatDuration(elapsedSeconds);

  // Layout positions (left to right):
  // [play button] [elapsed] [====track====] [total]
  const playCx = x + PLAY_RADIUS;
  const playCy = y;

  const elapsedX = playCx + PLAY_RADIUS + 10;
  const trackX = elapsedX + 38;
  const totalRightX = x + width;
  const totalTextX = totalRightX;
  const trackWidth = totalRightX - trackX - 40;

  const playedWidth = trackWidth * fraction;
  const scrubberCx = trackX + playedWidth;
  const trackY = y - TRACK_HEIGHT / 2;

  // Play button: circle + right-pointing triangle
  const triSize = 11;
  const triX = playCx - triSize * 0.4;
  const triY1 = playCy - triSize;
  const triY2 = playCy + triSize;
  const triX2 = playCx + triSize * 0.7;

  return `<g class="progress-bar">
    <circle class="play-btn-circle" cx="${playCx}" cy="${playCy}" r="${PLAY_RADIUS}" />
    <polygon class="play-btn-icon" points="${triX},${triY1} ${triX},${triY2} ${triX2},${playCy}" />
    <text class="time-label" x="${elapsedX}" y="${y + 4}" text-anchor="start">${escapeXml(elapsedLabel)}</text>
    <rect class="progress-track" x="${trackX}" y="${trackY}" width="${trackWidth}" height="${TRACK_HEIGHT}" rx="2" />
    <rect class="progress-played" x="${trackX}" y="${trackY}" width="${Math.max(0, playedWidth)}" height="${TRACK_HEIGHT}" rx="2" />
    <circle class="progress-scrubber" cx="${scrubberCx}" cy="${y}" r="${SCRUBBER_RADIUS}" />
    <text class="time-label" x="${totalTextX}" y="${y + 4}" text-anchor="end">${escapeXml(totalLabel)}</text>
  </g>`;
}
