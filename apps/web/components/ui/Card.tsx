import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

type Variant = 'solid' | 'glass' | 'bordered';

const variantCls: Record<Variant, string> = {
  solid: 'border border-border bg-surface-1',
  glass: 'glass-pill',
  bordered: 'border border-hairline bg-transparent',
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  padded?: boolean;
};

export function Card({ className, variant = 'solid', padded = true, ...rest }: CardProps) {
  return (
    <div
      className={cn('rounded-[var(--radius-lg)]', padded && 'p-6', variantCls[variant], className)}
      {...rest}
    />
  );
}

export function CardEyebrow({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'font-mono text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted',
        className,
      )}
      {...rest}
    />
  );
}

export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'font-display text-[1.35rem] font-semibold tracking-tight text-foreground',
        className,
      )}
      {...rest}
    />
  );
}
