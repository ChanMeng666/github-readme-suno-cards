'use client';

import { cn } from '../lib/cn.js';

type FilterOption = {
  value: string;
  label: string;
};

type FilterGroupProps = {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
};

function FilterGroup({ label, options, value, onChange }: FilterGroupProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
      <div className="flex items-center gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'focus-ring rounded-full border px-3 py-1 text-xs font-medium tracking-tight transition-all duration-200',
              value === opt.value
                ? 'border-transparent bg-foreground text-background'
                : 'border-border text-muted hover:border-border-strong hover:text-foreground',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export type Filters = {
  layout: string;
  preset: string;
  theme: string;
};

type FilterBarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="glass-pill flex flex-wrap items-center gap-x-5 gap-y-3 rounded-full px-5 py-3">
      <FilterGroup
        label="Layout"
        options={[
          { value: 'all', label: 'All' },
          { value: 'classic', label: 'Classic' },
          { value: 'player', label: 'Player' },
        ]}
        value={filters.layout}
        onChange={(layout) => onChange({ ...filters, layout })}
      />
      <span aria-hidden className="hidden h-5 w-px bg-hairline sm:inline-block" />
      <FilterGroup
        label="Preset"
        options={[
          { value: 'all', label: 'All' },
          { value: 'default', label: 'Default' },
          { value: 'suno', label: 'Suno' },
        ]}
        value={filters.preset}
        onChange={(preset) => onChange({ ...filters, preset })}
      />
      <span aria-hidden className="hidden h-5 w-px bg-hairline sm:inline-block" />
      <FilterGroup
        label="Theme"
        options={[
          { value: 'all', label: 'All' },
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ]}
        value={filters.theme}
        onChange={(theme) => onChange({ ...filters, theme })}
      />
    </div>
  );
}
