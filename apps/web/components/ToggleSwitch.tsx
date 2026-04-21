'use client';

import { cn } from '../lib/cn.js';

type ToggleSwitchProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex cursor-pointer select-none items-center gap-3 text-left"
    >
      <span
        className={cn(
          'focus-ring relative h-[20px] w-9 shrink-0 rounded-full border transition-colors duration-300',
          checked
            ? 'border-transparent bg-foreground'
            : 'border-border bg-[color:var(--surface-3)]',
        )}
      >
        <span
          className={cn(
            'absolute top-[1px] left-[1px] h-[16px] w-[16px] rounded-full transition-transform duration-300',
            checked
              ? 'translate-x-[16px] bg-background'
              : 'translate-x-0 border border-border bg-background',
          )}
        />
      </span>
      <span className="text-sm text-foreground transition-colors group-hover:text-muted-strong">
        {label}
      </span>
    </button>
  );
}
