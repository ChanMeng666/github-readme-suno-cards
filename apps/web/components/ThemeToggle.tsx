'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '../lib/cn.js';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div aria-hidden className="h-8 w-8" />;
  }

  const isDark = resolvedTheme !== 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'glass-pill-quiet focus-ring relative flex h-8 w-8 items-center justify-center rounded-full',
        'text-muted hover:text-foreground',
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <svg
        className={cn(
          'absolute h-4 w-4 transition-all duration-500',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100',
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
        role="img"
      >
        <title>Light mode</title>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      <svg
        className={cn(
          'absolute h-4 w-4 transition-all duration-500',
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0',
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden="true"
        role="img"
      >
        <title>Dark mode</title>
        <path d="M20.5 14.5A8 8 0 019.5 3.5a8.5 8.5 0 1011 11z" />
      </svg>
    </button>
  );
}
