'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '../lib/cn.js';

type ColorPickerProps = {
  label: string;
  value: string; // hex without '#'
  onChange: (hex: string) => void;
  defaultColor?: string; // for the color input default
};

export function ColorPicker({ label, value, onChange, defaultColor = '#888888' }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value ? `#${value}` : '');

  useEffect(() => {
    setHexInput(value ? `#${value}` : '');
  }, [value]);

  const handlePickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setHexInput(hex);
    onChange(hex.replace('#', ''));
  }, [onChange]);

  const handleHexInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHexInput(raw);
    const cleaned = raw.replace('#', '');
    if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
      onChange(cleaned);
    } else if (raw === '') {
      onChange('');
    }
  }, [onChange]);

  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-muted w-20 shrink-0">{label}</label>
      <input
        type="color"
        value={value ? `#${value}` : defaultColor}
        onChange={handlePickerChange}
        className="w-8 h-8 rounded-md border border-border cursor-pointer bg-transparent p-0.5 shrink-0"
      />
      <input
        type="text"
        value={hexInput}
        onChange={handleHexInput}
        placeholder="auto"
        maxLength={7}
        className={cn(
          'flex-1 bg-surface border border-border rounded-lg px-2.5 py-1.5',
          'text-xs font-mono text-foreground placeholder:text-muted/50',
          'focus:border-accent/50 focus:outline-none transition-colors',
        )}
      />
    </div>
  );
}
