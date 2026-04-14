'use client';

import { cn } from '../lib/cn.js';

type SegmentedControlProps = {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ label, options, value, onChange }: SegmentedControlProps) {
  return (
    <div>
      <span className="text-xs font-medium text-muted block mb-1.5">{label}</span>
      <div className="flex rounded-lg border border-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 px-3 py-1.5 text-xs font-medium transition-colors duration-150 text-center',
              value === opt.value
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground hover:bg-surface',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
