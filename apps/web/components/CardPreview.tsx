'use client';

import { useEffect, useRef, useState } from 'react';
import type { CardConfig } from '../lib/cardParams.js';
import { buildCardQueryString } from '../lib/cardParams.js';
import { cn } from '../lib/cn.js';

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

  return (
    <div className={cn('relative', className)}>
      {/* Skeleton */}
      {!loaded && src && (
        <div
          className="skeleton rounded-xl"
          style={{
            width: '100%',
            maxWidth: width,
            aspectRatio: config.layout === 'player' ? '640/160' : '480/140',
          }}
        />
      )}
      {src && (
        <img
          src={src}
          alt="Card preview"
          width={width}
          className={cn(
            'max-w-full h-auto rounded-xl transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0 absolute top-0 left-0',
          )}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
