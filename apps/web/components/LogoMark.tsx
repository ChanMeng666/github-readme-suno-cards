/**
 * The Suno Cards mark — a song card reduced to frame, cover and two text lines.
 * Drawn in `currentColor` so it follows the theme; `public/logo.svg` is the same
 * mark on a fixed dark tile, for places that can't inherit a colour (favicon, README).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      aria-hidden="true"
      role="img"
    >
      <rect x="10.5" y="26.5" width="79" height="47" rx="13" />
      <circle cx="32" cy="50" r="10.5" fill="currentColor" stroke="none" />
      <path d="M52 44H76M52 57H66" />
    </svg>
  );
}
