import { cn } from '../../lib/cn.js';

type Props = {
  variant?: 'dots' | 'lines';
  className?: string;
};

export function DotGridBackground({ variant = 'dots', className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 z-0',
        variant === 'dots' ? 'bg-dot-grid' : 'bg-grid-lines',
        className,
      )}
    />
  );
}
