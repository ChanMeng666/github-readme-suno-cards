'use client';

import { useMemo, useState } from 'react';
import { FilterBar, type Filters } from '../../components/FilterBar.js';
import { GalleryCard } from '../../components/GalleryCard.js';
import { ScrollReveal } from '../../components/ui/ScrollReveal.js';
import { GALLERY_PRESETS } from '../../lib/galleryPresets.js';

export default function GalleryPage() {
  const [filters, setFilters] = useState<Filters>({
    layout: 'all',
    preset: 'all',
    theme: 'all',
  });

  const filtered = useMemo(() => {
    return GALLERY_PRESETS.filter((p) => {
      if (filters.layout !== 'all' && p.config.layout !== filters.layout) return false;
      if (filters.preset !== 'all' && p.config.preset !== filters.preset) return false;
      if (filters.theme !== 'all' && p.config.theme !== filters.theme) return false;
      return true;
    });
  }, [filters]);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-16 pb-16">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-3">
        <span className="inline-flex w-fit">
          <span className="glass-pill-quiet rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-muted">
            Gallery
          </span>
        </span>
        <h1 className="font-display text-4xl italic leading-[1.05] tracking-tight text-foreground md:text-5xl">
          Every preset, at a glance.
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted md:text-base">
          Hover (or tap on mobile) any card to copy its embed code, or jump into the builder to
          customize it further.
        </p>
      </div>

      <div className="mb-10">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {filtered.length === 0 ? (
        <div className="glass-pill rounded-[var(--radius-lg)] px-6 py-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">No matches</p>
          <p className="mt-3 font-display text-xl italic text-foreground">
            Try loosening the filters.
          </p>
        </div>
      ) : (
        <ScrollReveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((preset) => (
              <GalleryCard
                key={preset.title}
                title={preset.title}
                description={preset.description}
                config={preset.config}
              />
            ))}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
