'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { cn } from '../../lib/cn.js';

type Props = {
  children: ReactNode;
  className?: string;
  /** Root margin for the IntersectionObserver. Default "0px 0px -18% 0px". */
  rootMargin?: string;
  /** Disable the reveal and render children normally. */
  disabled?: boolean;
  /** Apply reveal to direct children (auto staggered via CSS). */
  stagger?: boolean;
};

/**
 * IntersectionObserver-powered scroll reveal. Adds `revealed` to `.reveal-item`
 * descendants (or the wrapper itself) when they scroll into view.
 */
export function ScrollReveal({
  children,
  className,
  rootMargin = '0px 0px -18% 0px',
  disabled,
  stagger = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disabled) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>('.reveal-item');
    const list: HTMLElement[] = targets.length > 0 ? Array.from(targets) : [el];

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold: 0.08 },
    );

    for (const t of list) io.observe(t);

    return () => io.disconnect();
  }, [rootMargin, disabled]);

  return (
    <div ref={ref} className={cn(stagger ? '' : 'reveal-item', className)}>
      {children}
    </div>
  );
}
