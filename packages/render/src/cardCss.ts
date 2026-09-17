/**
 * The CSS block applied to every SVG root. This is injected ONCE per SVG,
 * not per card primitive, so stacked cards share a single stylesheet.
 *
 * Key design points:
 *   - All colors reference CSS custom properties from themes.ts so dark/light
 *     auto-switching via `@media (prefers-color-scheme)` just works.
 *   - The Suno model badge uses its OWN isolated variables (--badge-*-light
 *     and --badge-*-dark) so Suno's native tokens are preserved through the
 *     theme switch.
 *   - Fonts: system-ui stack for both Latin and CJK; adds Noto + PingFang +
 *     Hiragino fallbacks so Chinese/Japanese titles look right on any OS.
 */

export const CARD_CSS = `
  .card-root {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
      "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC",
      "Noto Sans CJK JP", sans-serif;
    color: var(--c-text);
  }
  .card-bg {
    fill: url(#card-gradient);
    stroke: var(--c-border);
    stroke-width: 1;
  }
  /* When theme=auto, two gradients are emitted; switch via media query
     so the card background stays in sync with the text colors. */
  .theme-auto .card-bg {
    fill: url(#card-gradient-light);
  }
  @media (prefers-color-scheme: dark) {
    .theme-auto .card-bg {
      fill: url(#card-gradient-dark);
    }
  }
  .cover-clip rect { fill: #000; }
  .cover-overlay {
    fill: url(#cover-shadow);
    pointer-events: none;
  }
  .song-title {
    font-size: 15px;
    font-weight: 700;
    line-height: 1.25;
    color: var(--c-text);
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }
  .song-by {
    font-size: 11px;
    color: var(--c-subtext);
    margin: 2px 0 0 0;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 7px;
  }
  .chip {
    display: inline-block;
    font-size: 10px;
    font-weight: 500;
    line-height: 1;
    padding: 3px 7px;
    border-radius: 10px;
    background: var(--c-chip-bg);
    color: var(--c-chip-text);
    border: 1px solid var(--c-chip-border);
    white-space: nowrap;
  }
  .stats-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    font-size: 11px;
    color: var(--c-subtext);
    margin-top: 7px;
    font-weight: 500;
    line-height: 1.4;
  }
  .stat {
    display: inline-block;
    white-space: nowrap;
  }
  .stat + .stat::before {
    content: " · ";
    margin: 0 4px;
    opacity: 0.6;
  }
  .badge-model {
    display: inline-block;
    font-size: 9px;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1.1;
    white-space: nowrap;
  }
  .badge-model-fallback {
    background: var(--c-chip-bg);
    color: var(--c-chip-text);
    border: 1px solid var(--c-chip-border);
  }
  /* Suno's badge tokens come in a light and a dark set. Pick one the same way
     the card background does: the root's theme class when the theme is pinned,
     prefers-color-scheme only under theme-auto. (The badge used to follow the
     media query unconditionally, so theme=dark showed light tokens on a light OS.) */
  .badge-model-suno {
    --badge-text: var(--badge-text-light);
    --badge-grad: var(--badge-grad-light);
    color: var(--badge-text);
    background: var(--badge-bg-light);
    border: 1px solid var(--badge-border-light);
  }
  .theme-dark .badge-model-suno {
    --badge-text: var(--badge-text-dark);
    --badge-grad: var(--badge-grad-dark);
    background: var(--badge-bg-dark);
    border-color: var(--badge-border-dark);
  }
  @media (prefers-color-scheme: dark) {
    .theme-auto .badge-model-suno {
      --badge-text: var(--badge-text-dark);
      --badge-grad: var(--badge-grad-dark);
      background: var(--badge-bg-dark);
      border-color: var(--badge-border-dark);
    }
  }
  /* Gradient text (V6 and later). Only where background-clip:text works;
     elsewhere the rule is skipped and the plain text colour above shows. */
  @supports ((-webkit-background-clip: text) or (background-clip: text)) {
    .badge-model-suno.has-grad {
      background-image: var(--badge-grad);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
    }
  }
  .badge-secondary {
    display: inline-block;
    font-size: 9px;
    font-weight: 500;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1.1;
    white-space: nowrap;
    color: var(--c-subtext);
    border: 1px solid var(--c-chip-border);
  }
  .duration-pill {
    fill: rgba(0, 0, 0, 0.7);
  }
  .duration-text {
    font-family: -apple-system, system-ui, sans-serif;
    font-size: 10px;
    font-weight: 600;
    fill: #ffffff;
  }
  .eq-bar { fill: var(--c-bar); }
  .profile-handle {
    font-size: 14px;
    font-weight: 700;
    color: var(--c-text);
    margin: 0;
  }
  .profile-name {
    font-size: 11px;
    color: var(--c-subtext);
    margin: 2px 0 0 0;
  }
  .profile-stats {
    display: flex;
    gap: 14px;
    margin-top: 8px;
    font-size: 11px;
    color: var(--c-text);
  }
  .profile-stat-num {
    font-weight: 700;
    font-size: 14px;
    color: var(--c-accent);
  }
  .profile-stat-label {
    color: var(--c-subtext);
    font-size: 10px;
    margin-left: 3px;
  }
  .error-box {
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .error-title { font-size: 14px; font-weight: 700; color: var(--c-text); margin: 0; }
  /* Details are often a URL or an issue path with no spaces; let them break
     anywhere, and cap them at three lines rather than overflow the card. */
  .error-subtitle {
    font-size: 11px;
    line-height: 1.35;
    color: var(--c-subtext);
    margin: 4px 0 0 0;
    max-width: 100%;
    overflow-wrap: anywhere;
    word-break: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Player layout elements */
  .player-title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
    color: var(--c-text);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .play-btn-circle {
    fill: var(--c-accent);
  }
  .play-btn-icon {
    fill: #ffffff;
  }
  .progress-track {
    fill: var(--c-progress-track);
  }
  .progress-played {
    fill: var(--c-accent);
  }
  .progress-scrubber {
    fill: var(--c-scrubber);
  }
  .time-label {
    font-family: -apple-system, system-ui, sans-serif;
    font-size: 12px;
    font-weight: 500;
    fill: var(--c-subtext);
  }
  .suno-logo {
    font-family: -apple-system, system-ui, sans-serif;
    font-size: 20px;
    font-weight: 800;
    fill: var(--c-text);
    opacity: 0.9;
    letter-spacing: 2px;
  }
  .link-icon {
    stroke: var(--c-subtext);
    stroke-width: 1.5;
    fill: none;
    opacity: 0.5;
  }
`;
