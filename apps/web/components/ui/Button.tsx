'use client';

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

type Size = 'sm' | 'md' | 'lg';
type Tone = 'glass' | 'primary' | 'quiet';

const sizeCls: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-sm',
};

const toneCls: Record<Tone, string> = {
  glass: 'glass-pill text-foreground',
  primary:
    'bg-foreground text-background border border-border-strong shadow-lg shadow-black/20 ' +
    'hover:-translate-y-0.5 transition-transform focus-ring',
  quiet: 'glass-pill-quiet text-muted hover:text-foreground',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: Size;
  tone?: Tone;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { size = 'md', tone = 'glass', icon, trailingIcon, className, children, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight',
        'transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
        sizeCls[size],
        toneCls[tone],
        className,
      )}
      {...rest}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children ? <span>{children}</span> : null}
      {trailingIcon ? <span className="shrink-0">{trailingIcon}</span> : null}
    </button>
  );
});
