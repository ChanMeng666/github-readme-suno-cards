'use client';

import { useCallback, useState } from 'react';
import { cn } from '../lib/cn.js';

type CodeBlockProps = {
  code: string;
  label?: string;
};

export function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div className="relative">
      {label && (
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          {label}
        </span>
      )}
      <div className="glass-pill relative rounded-[var(--radius-md)] p-4 pr-14">
        <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-muted-strong">
          <code className="whitespace-pre-wrap break-all">{code}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          className={cn(
            'glass-pill-quiet focus-ring absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full',
            copied ? 'text-[color:var(--success)]' : 'text-muted hover:text-foreground',
          )}
        >
          {copied ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              role="img"
            >
              <title>Copied</title>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              role="img"
            >
              <title>Copy</title>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
