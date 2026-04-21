'use client';

import { cn } from '../lib/cn.js';

type SegmentedControlProps = {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
};

export function SegmentedControl({
  label,
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps) {
  const itemCls = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <div>
      {label && (
        <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
          {label}
        </span>
      )}
      <div className="glass-pill-quiet inline-flex w-full items-center gap-1 rounded-full p-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'focus-ring flex-1 rounded-full font-medium tracking-tight transition-all duration-200',
              itemCls,
              value === opt.value
                ? 'bg-foreground text-background'
                : 'text-muted hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
