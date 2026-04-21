'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import type { CardConfig } from '../lib/cardParams.js';
import { buildCardQueryString, buildMarkdownEmbed } from '../lib/cardParams.js';
import { cn } from '../lib/cn.js';
import { ORIGIN_HINT } from '../lib/constants.js';

type GalleryCardProps = {
  title: string;
  description: string;
  config: CardConfig;
};

export function GalleryCard({ title, description, config }: GalleryCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const code = buildMarkdownEmbed(config, ORIGIN_HINT);
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [config]);

  const width = config.layout === 'player' ? 640 : 480;
  const qs = buildCardQueryString(config);

  return (
    <article className="reveal-item group glass-pill relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] transition-transform duration-500 hover:-translate-y-1">
      <div className="relative flex min-h-[140px] items-center justify-center p-5">
        <div
          aria-hidden
          className="luminance-wash pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-50"
        />
        <img
          src={`/api/card?${qs}&theme=${config.theme}`}
          alt={title}
          width={width}
          loading="lazy"
          className="h-auto max-w-full rounded-[var(--radius-md)]"
        />
      </div>

      <div className="flex items-start justify-between gap-3 border-t border-hairline px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base leading-tight text-foreground">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
        </div>
      </div>

      <div
        className={cn(
          'absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 transition-opacity duration-300',
          'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100',
        )}
      >
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'glass-pill focus-ring rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-tight',
            copied ? 'text-[color:var(--success)]' : 'text-foreground',
          )}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <Link
          href={`/builder?${qs}`}
          className="glass-pill-quiet focus-ring rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-tight text-muted hover:text-foreground"
        >
          Customize
        </Link>
      </div>
    </article>
  );
}
