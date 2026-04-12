/**
 * CSS keyframes for the Spotify-style overlays:
 *
 *   - `bar-bounce`: animates the bars' `height` as a percentage of their
 *     flex container. The container has `align-items: flex-end`, so bars
 *     grow upward from the bottom. Animating height (not transform: scaleY)
 *     avoids the SVG transform-box quirk where origin-relative scaling
 *     can overflow the parent in unpredictable ways.
 *
 *   - `new-pulse`: gentle pulse on the NEW badge.
 *
 * These keyframes are embedded in a single <style> block by `svg.ts` so
 * every card primitive can reference them by class.
 */

export const ANIMATION_CSS = `
  @keyframes bar-bounce {
    0%, 100% { height: 25%; }
    12%      { height: 65%; }
    26%      { height: 40%; }
    42%      { height: 95%; }
    58%      { height: 55%; }
    74%      { height: 85%; }
    88%      { height: 45%; }
  }
  @keyframes new-pulse {
    0%, 100% { transform: scale(1);    opacity: 0.95; }
    50%      { transform: scale(1.08); opacity: 1; }
  }

  .eq-wrap {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 6px;
    background: rgba(0, 0, 0, 0.55);
    border-radius: 6px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;
    overflow: hidden;
  }
  .eq-bar {
    display: block;
    width: 4px;
    min-height: 2px;
    background: var(--c-bar);
    border-radius: 1px;
    animation: bar-bounce ease-in-out infinite;
    will-change: height;
  }
  .eq-bar-1 { animation-duration: 1050ms; animation-delay:   0ms; }
  .eq-bar-2 { animation-duration: 1200ms; animation-delay:  40ms; }
  .eq-bar-3 { animation-duration:  980ms; animation-delay:  20ms; }
  .eq-bar-4 { animation-duration: 1120ms; animation-delay:  60ms; }

  .new-badge {
    transform-origin: center center;
    animation: new-pulse 2.2s ease-in-out infinite;
  }
`;
