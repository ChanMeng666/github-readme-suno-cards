'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '../lib/cn.js';

type ColorPickerProps = {
  label: string;
  value: string; // hex without '#'
  onChange: (hex: string) => void;
  defaultColor?: string;
};

export function ColorPicker({
  label,
  value,
  onChange,
  defaultColor = '#888888',
}: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value ? `#${value}` : '');

  useEffect(() => {
    setHexInput(value ? `#${value}` : '');
  }, [value]);

  const handlePickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hex = e.target.value;
      setHexInput(hex);
      onChange(hex.replace('#', ''));
    },
    [onChange],
  );

  const handleHexInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setHexInput(raw);
      const cleaned = raw.replace('#', '');
      if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
        onChange(cleaned);
      } else if (raw === '') {
        onChange('');
      }
    },
    [onChange],
  );

  const swatchValue = value ? `#${value}` : defaultColor;

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      <label
        className="focus-ring relative h-8 w-8 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border-strong"
        style={{ background: swatchValue }}
        aria-label={`${label} color picker`}
      >
        <input
          type="color"
          value={swatchValue}
          onChange={handlePickerChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <input
        type="text"
        value={hexInput}
        onChange={handleHexInput}
        placeholder="auto"
        maxLength={7}
        spellCheck={false}
        className={cn(
          'glass-pill-quiet focus-ring flex-1 rounded-full px-3 py-1.5 text-xs',
          'font-mono text-foreground placeholder:text-muted/60',
          'focus:outline-none',
        )}
      />
    </div>
  );
}
