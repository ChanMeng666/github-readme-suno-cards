'use client';

export function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="suno-cards logo" className="h-5 w-5" />
          <p>Built with Next.js on Vercel Edge Runtime</p>
        </div>
        <div className="flex items-center gap-4">
          <span>MIT License</span>
          <a
            href="https://github.com/ChanMeng666/github-readme-suno-cards"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-accent transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
