import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="hairline" />
        <div className="flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            <img src="/logo.svg" alt="" aria-hidden className="h-4 w-4 opacity-70" />
            <span>© Suno Cards · MIT License</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="https://github.com/ChanMeng666/github-readme-suno-cards"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-pill-quiet focus-ring rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
            >
              GitHub
            </Link>
            <Link
              href="https://github.com/ChanMeng666/github-readme-suno-cards/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-pill-quiet focus-ring rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
            >
              License
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
