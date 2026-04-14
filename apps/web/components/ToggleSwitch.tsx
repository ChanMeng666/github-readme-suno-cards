'use client';

import { cn } from '../lib/cn.js';

type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <span className="flex items-center gap-2.5 cursor-pointer select-none group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-8 h-[18px] rounded-full transition-colors duration-200',
          checked ? 'bg-accent' : 'bg-muted/30 border border-border',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked && 'translate-x-[14px]',
          )}
        />
      </button>
      <span className="text-xs text-foreground group-hover:text-accent transition-colors">
        {label}
      </span>
    </span>
  );
}
