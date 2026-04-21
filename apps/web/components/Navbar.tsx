'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/cn.js';
import { ThemeToggle } from './ThemeToggle.js';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/builder', label: 'Builder' },
] as const;

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-4 z-50 mx-auto w-full max-w-5xl px-4">
      <nav
        aria-label="Primary"
        className="glass-pill flex items-center justify-between gap-3 rounded-full px-3 py-2 sm:px-4"
      >
        <Link
          href="/"
          className="focus-ring flex items-center gap-2.5 rounded-full px-2 py-1 text-foreground"
        >
          <img src="/logo.svg" alt="" aria-hidden className="h-5 w-5" />
          <span className="font-display text-base leading-none tracking-tight">Suno Cards</span>
          <span aria-hidden className="hidden text-muted sm:inline">
            ·
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:inline">
            README
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'focus-ring relative rounded-full px-3 py-1.5 text-xs font-medium tracking-tight transition-colors',
                    isActive ? 'bg-foreground text-background' : 'text-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="ml-1 pl-1 sm:ml-2 sm:border-l sm:border-hairline sm:pl-2">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
