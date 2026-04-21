import type { CSSProperties, HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

type Props = HTMLAttributes<HTMLDivElement> & {
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
};

export function Skeleton({ className, width, height, aspectRatio, style, ...rest }: Props) {
  const mergedStyle: CSSProperties = {
    width,
    height,
    aspectRatio,
    ...style,
  };

  return <div aria-hidden className={cn('skeleton', className)} style={mergedStyle} {...rest} />;
}
