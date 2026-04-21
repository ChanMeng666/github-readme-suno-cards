'use client';

import { useEffect, useRef, useState } from 'react';
import type { CardConfig } from '../lib/cardParams.js';
import { buildCardQueryString } from '../lib/cardParams.js';
import { cn } from '../lib/cn.js';
import { Skeleton } from './ui/Skeleton.js';

type CardPreviewProps = {
  config: CardConfig;
  className?: string;
  /** Debounce delay in ms (default 300). Set to 0 for instant. */
  debounceMs?: number;
};

export function CardPreview({ config, className, debounceMs = 300 }: CardPreviewProps) {
  const [src, setSrc] = useState('');
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!config.id) return;

    const qs = buildCardQueryString(config);
    const url = `/api/card?${qs}&_t=${Date.now()}`;

    if (debounceMs <= 0) {
      setSrc(url);
      setLoaded(false);
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setSrc(url);
      setLoaded(false);
    }, debounceMs);

    return () => clearTimeout(timerRef.current);
  }, [config, debounceMs]);

  const width = config.layout === 'player' ? 640 : 480;
  const aspect = config.layout === 'player' ? '640/160' : '480/140';

  return (
    <div className={cn('relative', className)}>
      <div
        aria-hidden
        className="luminance-wash pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-60"
      />
      {!loaded && src && (
        <Skeleton
          aspectRatio={aspect}
          style={{ width: '100%', maxWidth: width }}
          className="rounded-[var(--radius-md)]"
        />
      )}
      {src && (
        <img
          src={src}
          alt="Card preview"
          width={width}
          className={cn(
            'h-auto max-w-full rounded-[var(--radius-md)] transition-opacity duration-500',
            loaded ? 'opacity-100' : 'absolute top-0 left-0 opacity-0',
          )}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
