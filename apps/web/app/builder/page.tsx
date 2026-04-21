'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { CardPreview } from '../../components/CardPreview.js';
import { CodeBlock } from '../../components/CodeBlock.js';
import { ColorPicker } from '../../components/ColorPicker.js';
import { SegmentedControl } from '../../components/SegmentedControl.js';
import { ToggleSwitch } from '../../components/ToggleSwitch.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
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
  last = false,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  last?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn(!last && 'border-b border-hairline')}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between py-4 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted transition-colors hover:text-foreground"
      >
        <span>{title}</span>
        <span aria-hidden className="text-base leading-none">
          {open ? '−' : '+'}
        </span>
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          open ? 'max-h-[600px] opacity-100 pb-5' : 'max-h-0 opacity-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}

// ── Tab Pills ────────────────────────────────────────

type Tab = 'markdown' | 'url' | 'html';

function TabPills({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { value: Tab; label: string }[] = [
    { value: 'markdown', label: 'Markdown' },
    { value: 'url', label: 'URL' },
    { value: 'html', label: 'HTML' },
  ];

  return (
    <div className="glass-pill-quiet inline-flex items-center gap-1 rounded-full p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={cn(
            'focus-ring rounded-full px-3 py-1.5 text-[11px] font-medium tracking-tight transition-colors',
            active === tab.value
              ? 'bg-foreground text-background'
              : 'text-muted hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── Builder Inner ────────────────────────────────────

function BuilderInner() {
  const searchParams = useSearchParams();
  const [config, dispatch] = useReducer(reducer, getDefaultConfig(DEMO_UUID));
  const [activeTab, setActiveTab] = useState<Tab>('markdown');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    const parsed = parseCardConfig(searchParams);
    if (Object.keys(parsed).length > 0) {
      if (parsed.layout) {
        dispatch({ type: 'SET_LAYOUT', layout: parsed.layout });
      }
      dispatch({ type: 'LOAD_CONFIG', config: parsed });
    }
    setInitialized(true);
  }, [searchParams, initialized]);

  useEffect(() => {
    if (!initialized) return;
    const url = buildCardUrl(config);
    const qs = url.replace('/api/card?', '');
    window.history.replaceState(null, '', `/builder?${qs}`);
  }, [config, initialized]);

  const embedCode = useMemo(() => {
    switch (activeTab) {
      case 'markdown':
        return buildMarkdownEmbed(config, ORIGIN_HINT);
      case 'url':
        return buildCardUrl(config, ORIGIN_HINT);
      case 'html':
        return buildHtmlEmbed(config, ORIGIN_HINT);
    }
  }, [config, activeTab]);

  const setField = useCallback((field: keyof CardConfig, value: string | boolean) => {
    dispatch({ type: 'SET_FIELD', field, value });
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-16 pb-16">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-3">
        <span className="inline-flex w-fit">
          <span className="glass-pill-quiet rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
            Builder
          </span>
        </span>
        <h1 className="font-display text-4xl italic leading-[1.05] tracking-tight text-foreground md:text-5xl">
          Craft your card.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Tweak anything on the left, preview instantly on the right, then copy the embed when
          you're happy.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* Controls */}
        <div className="glass-pill rounded-[var(--radius-lg)] px-6 py-2">
          <Section title="Song Input">
            <div>
              <label
                htmlFor="song-id-input"
                className="mb-2 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted"
              >
                Song ID or URL
              </label>
              <input
                id="song-id-input"
                type="text"
                value={config.id}
                onChange={(e) => setField('id', e.target.value.trim())}
                placeholder="Song UUID, short code, or full URL"
                spellCheck={false}
                className={cn(
                  'glass-pill-quiet focus-ring w-full rounded-full px-4 py-2.5',
                  'text-sm text-foreground placeholder:text-muted/60 font-mono',
                  'focus:outline-none',
                )}
              />
            </div>
          </Section>

          <Section title="Layout & Theme">
            <div className="space-y-4">
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

          <Section title="Colors">
            <div className="space-y-3">
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
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'RESET_COLORS' })}
                  className="focus-ring rounded-full px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
                >
                  Reset
                </button>
              </div>
            </div>
          </Section>

          <Section title="Element Toggles" last>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
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
        <div className="lg:sticky lg:top-24 lg:self-start space-y-5">
          <div className="glass-pill flex min-h-[240px] items-center justify-center rounded-[var(--radius-lg)] p-6">
            <CardPreview config={config} debounceMs={300} />
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                Embed code
              </span>
              <TabPills active={activeTab} onChange={setActiveTab} />
            </div>
            <CodeBlock code={embedCode} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page wrapper ─────────────────────────────────────

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-16">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="mb-10 h-4 w-96" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
            <Skeleton height={600} className="rounded-[var(--radius-lg)]" />
            <Skeleton height={300} className="rounded-[var(--radius-lg)]" />
          </div>
        </div>
      }
    >
      <BuilderInner />
    </Suspense>
  );
}
