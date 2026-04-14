'use client';

import { useMemo, useState } from 'react';
import { FilterBar, type Filters } from '../../components/FilterBar.js';
import { GalleryCard } from '../../components/GalleryCard.js';
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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-2xl font-bold text-foreground">Style Gallery</h1>
      <p className="mt-2 text-sm text-muted">
        Browse all preset combinations. Hover to copy embed code or customize in the builder.
      </p>

      <div className="mt-6 mb-8">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted py-12 text-center">
          No cards match the current filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((preset) => (
            <GalleryCard
              key={preset.title}
              title={preset.title}
              description={preset.description}
              config={preset.config}
            />
          ))}
        </div>
      )}
    </div>
  );
}
