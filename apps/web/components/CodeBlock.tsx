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
    <div className="relative group">
      {label && (
        <span className="text-xs font-medium text-muted mb-1 block">{label}</span>
      )}
      <div className="relative">
        <pre className="bg-surface border border-border rounded-lg p-3 pr-12 overflow-x-auto text-xs font-mono leading-relaxed">
          <code className="text-muted break-all whitespace-pre-wrap">{code}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'absolute top-2 right-2 p-1.5 rounded-md border transition-all duration-200',
            'text-muted hover:text-foreground',
            copied
              ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
              : 'bg-surface border-border hover:bg-muted/10',
          )}
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
