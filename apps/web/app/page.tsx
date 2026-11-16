'use client';

import { DotGridBackground } from '../components/ui/DotGridBackground.js';
import { GiantWordmark } from '../components/ui/GiantWordmark.js';
import { LuminanceBackdrop } from '../components/ui/LuminanceBackdrop.js';
import { PillLink } from '../components/ui/PillLink.js';
import { ScrollReveal } from '../components/ui/ScrollReveal.js';
import { DEMO_HANDLE, DEMO_UUID } from '../lib/constants.js';

const FEATURED_CARDS = [
  {
    title: 'Classic — Dark',
    caption: 'Information-dense default.',
    params: `id=${DEMO_UUID}&theme=dark`,
    width: 480,
  },
  {
    title: 'Player — Suno',
    caption: 'Navy & gold, Suno branding.',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&theme=dark`,
    width: 640,
  },
  {
    title: 'Classic — Light',
    caption: 'Clean mode for bright READMEs.',
    params: `id=${DEMO_UUID}&theme=light`,
    width: 480,
  },
  {
    title: 'Player — Custom',
    caption: 'Any hex accent of your choice.',
    params: `id=${DEMO_UUID}&layout=player&theme=dark&accent_color=ff6b6b`,
    width: 640,
  },
];

const FEATURES = [
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
        role="img"
      >
        <title>Two layouts icon</title>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
    title: 'Two Layouts',
    description: 'Classic info-dense cards or player-style with progress bars.',
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
        role="img"
      >
        <title>Color presets icon</title>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a4.5 4.5 0 000 9 4.5 4.5 0 010 9" />
      </svg>
    ),
    title: 'Color Presets',
    description: 'Default monochrome or Suno navy + gold. Full custom color overrides.',
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
        role="img"
      >
        <title>Customization icon</title>
        <path d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364" />
      </svg>
    ),
    title: 'Full Customization',
    description: '11 toggle options for every card element. Make it yours.',
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
        role="img"
      >
        <title>Auto-sync icon</title>
        <path d="M4 4v16h16" />
        <polyline points="4 14 8 10 12 14 20 6" />
      </svg>
    ),
    title: 'Auto-Sync',
    description: 'GitHub Action keeps your README in sync with your latest songs.',
  },
];

const ArrowRight = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    aria-hidden="true"
    role="img"
  >
    <title>Arrow right</title>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-24 sm:pt-32 sm:pb-32">
        <LuminanceBackdrop intensity="strong" />
        <DotGridBackground />
        <GiantWordmark text="SUNO" className="top-[42%] -translate-y-1/2 opacity-60" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-8 inline-flex">
            <span className="glass-pill-quiet rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
              GitHub README · Suno AI
            </span>
          </div>

          <h1 className="font-display text-5xl leading-[0.95] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            <span className="italic">Turn your music</span>
            <br />
            <span className="not-italic">into living cards.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Embed dynamic, animated SVG cards for any Suno AI song directly in your README. No
            backend, no build step — just a URL.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <PillLink href="/builder" tone="primary" size="lg" trailingIcon={ArrowRight}>
              Build Your Card
            </PillLink>
            <PillLink href="/gallery" tone="quiet" size="lg">
              Browse Gallery
            </PillLink>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="hairline" />
        <div className="mt-16 mb-10 flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
            Feature set
          </span>
          <h2 className="font-display italic text-3xl text-foreground md:text-4xl">
            Designed to be mostly invisible.
          </h2>
        </div>

        <ScrollReveal>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className={`reveal-item stagger-${i + 1} border-t border-hairline pt-6`}
              >
                <div className="glass-pill-quiet mb-5 flex h-10 w-10 items-center justify-center rounded-full text-foreground">
                  {feature.icon}
                </div>
                <h3 className="font-display-roman text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Featured styles */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="hairline" />
        <div className="mt-16 mb-10 flex items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
              Featured styles
            </span>
            <h2 className="font-display italic text-3xl text-foreground md:text-4xl">
              A taste of what's possible.
            </h2>
          </div>
          <PillLink href="/gallery" tone="quiet" size="sm" trailingIcon={ArrowRight}>
            Full gallery
          </PillLink>
        </div>

        <ScrollReveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {FEATURED_CARDS.map((card, i) => (
              <div
                key={card.title}
                className={`reveal-item stagger-${i + 1} glass-pill rounded-[var(--radius-lg)] p-5 transition-transform duration-500 hover:-translate-y-1`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                    {card.title}
                  </p>
                </div>
                <img
                  src={`/api/card?${card.params}`}
                  alt={card.title}
                  width={card.width}
                  loading="lazy"
                  className="h-auto max-w-full rounded-[var(--radius-md)]"
                />
                <p className="mt-4 text-xs leading-relaxed text-muted">{card.caption}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* Profile & Stack */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="hairline" />
        <div className="mt-16 mb-10 flex flex-col gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
            Beyond single songs
          </span>
          <h2 className="font-display italic text-3xl text-foreground md:text-4xl">
            Profiles and stacks, automatically.
          </h2>
        </div>

        <ScrollReveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="reveal-item stagger-1 glass-pill rounded-[var(--radius-lg)] p-6">
              <h3 className="font-display-roman text-base font-semibold text-foreground">
                Profile Summary
              </h3>
              <p className="mt-1 text-sm text-muted">Your Suno profile stats at a glance.</p>
              <img
                src={`/api/profile?handle=${DEMO_HANDLE}`}
                alt="Profile card"
                width={480}
                loading="lazy"
                className="mt-5 h-auto max-w-full rounded-[var(--radius-md)]"
              />
            </div>
            <div className="reveal-item stagger-2 glass-pill rounded-[var(--radius-lg)] p-6">
              <h3 className="font-display-roman text-base font-semibold text-foreground">
                Auto-Discovered Stack
              </h3>
              <p className="mt-1 text-sm text-muted">Top songs stacked together automatically.</p>
              <img
                src={`/api/cards?handle=${DEMO_HANDLE}&sort=play_count&max=3`}
                alt="Card stack"
                width={480}
                loading="lazy"
                className="mt-5 h-auto max-w-full rounded-[var(--radius-md)]"
              />
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="relative mx-auto mt-8 max-w-5xl overflow-hidden px-6 pb-24">
        <div className="glass-pill relative rounded-[var(--radius-xl)] px-6 py-16 text-center sm:px-12">
          <LuminanceBackdrop intensity="default" className="opacity-70" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl italic tracking-tight text-foreground md:text-5xl">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted md:text-base">
              Three lines of markdown. Zero maintenance. Works everywhere GitHub renders Markdown.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <PillLink href="/builder" tone="primary" size="lg" trailingIcon={ArrowRight}>
                Start Building
              </PillLink>
              <PillLink
                href="https://github.com/ChanMeng666/github-readme-suno-cards"
                external
                tone="glass"
                size="lg"
              >
                View on GitHub
              </PillLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
