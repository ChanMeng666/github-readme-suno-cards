'use client';

import Link from 'next/link';
import { cn } from '../lib/cn.js';
import { DEMO_HANDLE, DEMO_UUID } from '../lib/constants.js';

const FEATURED_CARDS = [
  { title: 'Classic Dark', params: `id=${DEMO_UUID}&theme=dark`, width: 480 },
  {
    title: 'Player Suno',
    params: `id=${DEMO_UUID}&layout=player&preset=suno&theme=dark`,
    width: 640,
  },
  { title: 'Classic Light', params: `id=${DEMO_UUID}&theme=light`, width: 480 },
  {
    title: 'Player Custom',
    params: `id=${DEMO_UUID}&layout=player&theme=dark&accent_color=ff6b6b`,
    width: 640,
  },
];

const FEATURES = [
  {
    icon: (
      <svg
        className="w-5 h-5"
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
        className="w-5 h-5"
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
    description: 'Default purple or Suno navy + gold. Full custom color overrides.',
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
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
        className="w-5 h-5"
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

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
          Suno Cards
        </h1>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Turn your Suno AI music into dynamic, animated SVG cards — embed them anywhere on GitHub.
        </p>

        {/* Floating card previews */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <img
            src={`/api/card?id=${DEMO_UUID}&theme=dark`}
            alt="Classic card example"
            width={480}
            className="max-w-full h-auto rounded-xl animate-float shadow-lg"
            loading="eager"
          />
          <img
            src={`/api/card?id=${DEMO_UUID}&layout=player&preset=suno&theme=dark`}
            alt="Player card example"
            width={640}
            className="max-w-full h-auto rounded-xl animate-float-delayed shadow-lg"
            loading="eager"
          />
        </div>

        {/* CTAs */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/gallery"
            className={cn(
              'px-5 py-2.5 text-sm font-medium rounded-lg border border-border',
              'text-foreground hover:bg-surface transition-colors duration-200',
            )}
          >
            Browse Gallery
          </Link>
          <Link
            href="/builder"
            className={cn(
              'px-5 py-2.5 text-sm font-medium rounded-lg',
              'bg-accent text-white hover:bg-accent-hover transition-colors duration-200',
            )}
          >
            Build Your Card
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature) => (
            <div key={feature.title}>
              <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1 text-sm text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured cards */}
      <section className="py-16 border-t border-border">
        <h2 className="text-xl font-semibold text-foreground mb-2">Featured Styles</h2>
        <p className="text-sm text-muted mb-8">
          A taste of what's possible. Browse the full gallery or build your own.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_CARDS.map((card) => (
            <div
              key={card.title}
              className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 transition-colors duration-200"
            >
              <p className="text-xs font-medium text-muted mb-3">{card.title}</p>
              <img
                src={`/api/card?${card.params}`}
                alt={card.title}
                width={card.width}
                className="max-w-full h-auto rounded-lg"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Profile & Stack showcase */}
      <section className="py-16 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Profile Summary Card</h3>
            <p className="text-sm text-muted mb-4">Show your Suno profile stats at a glance.</p>
            <img
              src={`/api/profile?handle=${DEMO_HANDLE}`}
              alt="Profile card"
              width={480}
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Auto-Discovered Card Stack
            </h3>
            <p className="text-sm text-muted mb-4">
              Your top songs, stacked together automatically.
            </p>
            <img
              src={`/api/cards?handle=${DEMO_HANDLE}&sort=play_count&max=3`}
              alt="Card stack"
              width={480}
              className="max-w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
