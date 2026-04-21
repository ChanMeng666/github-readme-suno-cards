import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

type Tone = 'default' | 'success' | 'destructive';

const toneCls: Record<Tone, string> = {
  default: 'text-muted border-border',
  success: 'text-[color:var(--success)] border-[color:var(--success)]/30',
  destructive: 'text-[color:var(--destructive)] border-[color:var(--destructive)]/30',
};

type Props = HTMLAttributes<HTMLSpanElement> & { tone?: Tone };

export function TagChip({ className, tone = 'default', ...rest }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5',
        'font-mono text-[0.68rem] uppercase tracking-[0.12em]',
        toneCls[tone],
        className,
      )}
      {...rest}
    />
  );
}
