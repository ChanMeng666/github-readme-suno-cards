'use client';

import Link, { type LinkProps } from 'next/link';
import { type AnchorHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

type Size = 'sm' | 'md' | 'lg';
type Tone = 'glass' | 'primary' | 'quiet';

const sizeCls: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm md:px-10 md:py-5 md:text-base',
};

const toneCls: Record<Tone, string> = {
  glass: 'glass-pill text-foreground hover:-translate-y-0.5',
  primary:
    'bg-foreground text-background border border-border-strong shadow-lg shadow-black/20 ' +
    'hover:-translate-y-0.5 transition-transform focus-ring',
  quiet: 'glass-pill-quiet text-muted hover:text-foreground',
};

type BaseProps = {
  size?: Size;
  tone?: Tone;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  className?: string;
  children: ReactNode;
};

type Props = BaseProps &
  Omit<LinkProps, 'href'> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseProps | 'href'> & {
    href: string;
    external?: boolean;
  };

export const PillLink = forwardRef<HTMLAnchorElement, Props>(function PillLink(
  { size = 'md', tone = 'glass', icon, trailingIcon, className, children, href, external, ...rest },
  ref,
) {
  const anchorClass = cn(
    'group inline-flex items-center gap-2 rounded-full font-semibold tracking-tight',
    'transition-transform duration-300',
    sizeCls[size],
    toneCls[tone],
    className,
  );

  const content = (
    <>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
      {trailingIcon ? (
        <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );

  if (external) {
    return (
      <a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={anchorClass}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <Link ref={ref} href={href} className={anchorClass} {...rest}>
      {content}
    </Link>
  );
});
