/** Format a duration in seconds as "M:SS" or "H:MM:SS". */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00';
  const t = Math.round(totalSeconds);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

/**
 * Format a count compactly: 1234 → "1.2k", 987654 → "987k", 12345678 → "12M".
 * Same style as YouTube/Spotify stats.
 */
export function formatCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '0';
  if (n < 1000) return String(Math.floor(n));
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  if (n < 1_000_000) return `${Math.floor(n / 1000)}k`;
  if (n < 10_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  return `${Math.floor(n / 1_000_000)}M`;
}
