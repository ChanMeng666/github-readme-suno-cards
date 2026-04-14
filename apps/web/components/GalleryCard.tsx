'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import type { CardConfig } from '../lib/cardParams.js';
import { buildCardQueryString, buildCardUrl, buildMarkdownEmbed } from '../lib/cardParams.js';
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
    <div className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:border-accent/30 transition-all duration-200 hover:shadow-lg hover:shadow-accent/5">
      {/* Preview frame */}
      <div className="p-4 flex items-center justify-center min-h-[120px]">
        <img
          src={`/api/card?${qs}&theme=${config.theme}`}
          alt={title}
          width={width}
          className="max-w-full h-auto rounded-lg"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="text-xs text-muted mt-0.5">{description}</p>
      </div>

      {/* Hover overlay */}
      <div className={cn(
        'absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-3',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
      )}>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200',
            copied
              ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
              : 'border-border text-foreground hover:bg-surface',
          )}
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
        <Link
          href={`/builder?${qs}`}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors duration-200"
        >
          Customize
        </Link>
      </div>
    </div>
  );
}
