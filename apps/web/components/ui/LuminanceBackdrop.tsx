import { cn } from '../../lib/cn.js';

type Props = {
  className?: string;
  intensity?: 'subtle' | 'default' | 'strong';
  animated?: boolean;
};

const sizeByIntensity = {
  subtle: 'h-[50vh] w-[60vw]',
  default: 'h-[65vh] w-[80vw]',
  strong: 'h-[90vh] w-[110vw]',
} as const;

export function LuminanceBackdrop({ className, intensity = 'default', animated = true }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-[50%] luminance-wash',
        sizeByIntensity[intensity],
        animated && 'animate-breathe',
        className,
      )}
    />
  );
}
