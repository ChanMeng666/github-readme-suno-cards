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
      <span className="text-xs font-medium text-muted whitespace-nowrap">{label}</span>
      <div className="flex rounded-lg border border-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium transition-colors duration-150',
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
    <div className="flex flex-wrap items-center gap-4">
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
