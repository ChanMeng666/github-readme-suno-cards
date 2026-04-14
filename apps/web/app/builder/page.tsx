'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { CardPreview } from '../../components/CardPreview.js';
import { CodeBlock } from '../../components/CodeBlock.js';
import { ColorPicker } from '../../components/ColorPicker.js';
import { SegmentedControl } from '../../components/SegmentedControl.js';
import { ToggleSwitch } from '../../components/ToggleSwitch.js';
import type { CardConfig, CardLayout } from '../../lib/cardParams.js';
import {
  buildCardUrl,
  buildHtmlEmbed,
  buildMarkdownEmbed,
  getDefaultConfig,
  getLayoutDefaults,
  parseCardConfig,
} from '../../lib/cardParams.js';
import { cn } from '../../lib/cn.js';
import { DEMO_UUID, ORIGIN_HINT } from '../../lib/constants.js';

// ── Reducer ──────────────────────────────────────────

type Action =
  | { type: 'SET_FIELD'; field: keyof CardConfig; value: string | boolean }
  | { type: 'SET_LAYOUT'; layout: CardLayout }
  | { type: 'LOAD_CONFIG'; config: Partial<CardConfig> }
  | { type: 'RESET_COLORS' };

function reducer(state: CardConfig, action: Action): CardConfig {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_LAYOUT':
      return {
        ...state,
        layout: action.layout,
        ...getLayoutDefaults(action.layout),
      };
    case 'LOAD_CONFIG':
      return { ...state, ...action.config };
    case 'RESET_COLORS':
      return { ...state, bgColor: '', textColor: '', accentColor: '' };
    default:
      return state;
  }
}

// ── Toggle definitions ───────────────────────────────

const TOGGLES: { key: keyof CardConfig; label: string }[] = [
  { key: 'showEqualizer', label: 'Equalizer' },
  { key: 'showTags', label: 'Tags' },
  { key: 'showPlays', label: 'Plays' },
  { key: 'showLikes', label: 'Likes' },
  { key: 'showAuthor', label: 'Author' },
  { key: 'showDuration', label: 'Duration' },
  { key: 'showModelBadge', label: 'Model Badge' },
  { key: 'showNewBadge', label: 'NEW Badge' },
  { key: 'showProgress', label: 'Progress Bar' },
  { key: 'showLogo', label: 'SUNO Logo' },
  { key: 'showLinkIcon', label: 'Link Icon' },
];

// ── Collapsible Section ──────────────────────────────

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-xs font-semibold text-muted uppercase tracking-wider hover:text-foreground transition-colors"
      >
        {title}
        <svg
          className={cn('w-4 h-4 transition-transform duration-200', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          open ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ── Builder Inner (needs searchParams) ───────────────

function BuilderInner() {
  const searchParams = useSearchParams();
  const [config, dispatch] = useReducer(reducer, getDefaultConfig(DEMO_UUID));
  const [activeTab, setActiveTab] = useState<'markdown' | 'url' | 'html'>('markdown');
  const [initialized, setInitialized] = useState(false);

  // Load from URL params on mount
  useEffect(() => {
    if (initialized) return;
    const parsed = parseCardConfig(searchParams);
    if (Object.keys(parsed).length > 0) {
      // If layout is specified, first apply layout defaults, then override with parsed values
      if (parsed.layout) {
        dispatch({ type: 'SET_LAYOUT', layout: parsed.layout });
      }
      dispatch({ type: 'LOAD_CONFIG', config: parsed });
    }
    setInitialized(true);
  }, [searchParams, initialized]);

  // Sync state to URL
  useEffect(() => {
    if (!initialized) return;
    const url = buildCardUrl(config);
    const qs = url.replace('/api/card?', '');
    window.history.replaceState(null, '', `/builder?${qs}`);
  }, [config, initialized]);

  const embedCode = useMemo(() => {
    switch (activeTab) {
      case 'markdown': return buildMarkdownEmbed(config, ORIGIN_HINT);
      case 'url': return buildCardUrl(config, ORIGIN_HINT);
      case 'html': return buildHtmlEmbed(config, ORIGIN_HINT);
    }
  }, [config, activeTab]);

  const setField = useCallback(
    (field: keyof CardConfig, value: string | boolean) => {
      dispatch({ type: 'SET_FIELD', field, value });
    },
    [],
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground">Card Builder</h1>
      <p className="mt-2 text-sm text-muted">
        Customize your card, preview it live, then copy the embed code.
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
        {/* Controls */}
        <div className="bg-surface border border-border rounded-xl p-5">
          {/* Song Input */}
          <Section title="Song Input">
            <div>
              <label className="text-xs font-medium text-muted block mb-1.5">
                Song ID or URL
              </label>
              <input
                type="text"
                value={config.id}
                onChange={(e) => setField('id', e.target.value.trim())}
                placeholder="Song UUID, short code, or full URL"
                className={cn(
                  'w-full bg-background border border-border rounded-lg px-3 py-2',
                  'text-sm text-foreground placeholder:text-muted/50',
                  'focus:border-accent/50 focus:outline-none transition-colors',
                )}
              />
            </div>
          </Section>

          {/* Layout & Theme */}
          <Section title="Layout & Theme">
            <div className="space-y-3">
              <SegmentedControl
                label="Layout"
                options={[
                  { value: 'classic', label: 'Classic' },
                  { value: 'player', label: 'Player' },
                ]}
                value={config.layout}
                onChange={(v) => dispatch({ type: 'SET_LAYOUT', layout: v as CardLayout })}
              />
              <SegmentedControl
                label="Preset"
                options={[
                  { value: 'default', label: 'Default' },
                  { value: 'suno', label: 'Suno' },
                ]}
                value={config.preset}
                onChange={(v) => setField('preset', v)}
              />
              <SegmentedControl
                label="Theme"
                options={[
                  { value: 'dark', label: 'Dark' },
                  { value: 'light', label: 'Light' },
                  { value: 'auto', label: 'Auto' },
                ]}
                value={config.theme}
                onChange={(v) => setField('theme', v)}
              />
            </div>
          </Section>

          {/* Colors */}
          <Section title="Colors">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <ColorPicker
                  label="Background"
                  value={config.bgColor}
                  onChange={(v) => setField('bgColor', v)}
                  defaultColor="#12121a"
                />
                <ColorPicker
                  label="Text"
                  value={config.textColor}
                  onChange={(v) => setField('textColor', v)}
                  defaultColor="#f5f5f7"
                />
                <ColorPicker
                  label="Accent"
                  value={config.accentColor}
                  onChange={(v) => setField('accentColor', v)}
                  defaultColor="#a78bfa"
                />
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: 'RESET_COLORS' })}
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                Reset to preset defaults
              </button>
            </div>
          </Section>

          {/* Element Toggles */}
          <Section title="Element Toggles">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {TOGGLES.map(({ key, label }) => (
                <ToggleSwitch
                  key={key}
                  label={label}
                  checked={config[key] as boolean}
                  onChange={(v) => setField(key, v)}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* Preview + Embed */}
        <div className="lg:sticky lg:top-20 lg:self-start space-y-6">
          {/* Preview frame */}
          <div className="bg-surface border border-border rounded-xl p-6 flex items-center justify-center min-h-[200px]">
            <CardPreview config={config} debounceMs={300} />
          </div>

          {/* Embed code */}
          <div>
            <div className="flex items-center gap-1 mb-3">
              {(['markdown', 'url', 'html'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150',
                    activeTab === tab
                      ? 'bg-foreground text-background'
                      : 'text-muted hover:text-foreground',
                  )}
                >
                  {tab === 'markdown' ? 'Markdown' : tab === 'url' ? 'URL' : 'HTML'}
                </button>
              ))}
            </div>
            <CodeBlock code={embedCode} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper with Suspense ───────────────────────

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="skeleton h-8 w-48 rounded-lg mb-4" />
        <div className="skeleton h-4 w-96 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
          <div className="skeleton h-[600px] rounded-xl" />
          <div className="skeleton h-[300px] rounded-xl" />
        </div>
      </div>
    }>
      <BuilderInner />
    </Suspense>
  );
}
