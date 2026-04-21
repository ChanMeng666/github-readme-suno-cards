import { cn } from '../../lib/cn.js';

type Props = {
  text: string;
  className?: string;
};

export function GiantWordmark({ text, className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'giant-wordmark absolute left-1/2 -translate-x-1/2 whitespace-nowrap',
        className,
      )}
    >
      {text}
    </div>
  );
}
