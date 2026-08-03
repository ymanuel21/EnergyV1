'use client';

import { useState } from 'react';
import type { MediaItem } from '@/lib/services/media';

const SOURCES = ['all', 'product', 'project', 'brand', 'banner', 'testimonial'] as const;
type SourceFilter = typeof SOURCES[number];

const SOURCE_LABELS: Record<string, string> = {
  product: 'Produk', project: 'Proyek', brand: 'Brand', banner: 'Banner', testimonial: 'Testimoni',
};

export function MediaBrowser({ items }: { items: MediaItem[] }) {
  const [filter, setFilter] = useState<SourceFilter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  // Deduplicate by URL
  const seen = new Set<string>();
  const unique = items.filter(i => { if (seen.has(i.url)) return false; seen.add(i.url); return true; });

  // Total counts (always from full dataset)
  const totals: Record<string, number> = { all: unique.length };
  items.forEach(i => { totals[i.source] = (totals[i.source] || 0) + 1; });

  // Filter
  const filtered = filter === 'all' ? unique : unique.filter(i => i.source === filter);
  const selectedItem = filtered.find(i => i.id === selected);

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg('URL copied!');
      setTimeout(() => setCopyMsg(null), 2000);
    });
  }

  return (
    <div>
      {copyMsg && <div className="mb-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{copyMsg}</div>}

      {/* Filter chips */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {SOURCES.map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            aria-pressed={filter === key}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              filter === key
                ? 'bg-primary text-white border-primary'
                : 'bg-card text-primary border-border hover:bg-surface'
            }`}
          >
            {key === 'all' ? 'All' : SOURCE_LABELS[key] || key}
            <span className={`rounded-full px-1.5 py-0 text-[10px] ${filter === key ? 'bg-white/20' : 'bg-surface/50'}`}>
              {totals[key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted">No media found</p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="mt-2 text-xs text-primary hover:underline">
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {filtered.map(a => (
            <div key={a.id}
              className={`rounded-lg border bg-card overflow-hidden transition cursor-pointer ${selected === a.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
              onClick={() => setSelected(selected === a.id ? null : a.id)}>
              <div className="aspect-square flex items-center justify-center bg-surface">
                <img src={a.url} alt={a.name} className="max-h-full max-w-full object-contain p-2"
                  onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect fill="%23f3f4f6" width="40" height="40"/><text x="50%" y="55%" text-anchor="middle" fill="%239ca3af" font-size="10">404</text></svg>'; }} />
              </div>
              <div className="p-2">
                <p className="text-xs text-primary truncate font-medium">{a.sourceName}</p>
                <p className="text-[10px] text-muted truncate">{a.name}</p>
                <span className="inline-block mt-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
                  {SOURCE_LABELS[a.source] || a.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected detail */}
      {selectedItem && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <img src={selectedItem.url} alt={selectedItem.name} className="h-16 w-16 rounded object-cover bg-surface" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">{selectedItem.sourceName}</p>
              <p className="text-xs text-muted truncate">{selectedItem.url}</p>
              <p className="text-xs text-muted">{SOURCE_LABELS[selectedItem.source] || selectedItem.source}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleCopy(selectedItem.url)} className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface">Copy URL</button>
              <a href={selectedItem.url} target="_blank" rel="noopener" className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface">View</a>
            </div>
          </div>

          {/* Used by section */}
          {selectedItem.usages && selectedItem.usages.length > 1 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs font-medium text-primary mb-2">Used by ({selectedItem.usages.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedItem.usages.map((u, i) => (
                  <a key={i} href={`/admin/${u.source}s${u.source === 'homepage' ? '' : '/' + u.sourceId}`}
                    className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[11px] text-muted hover:text-primary hover:bg-surface/80 transition">
                    <span className="font-medium">{SOURCE_LABELS[u.source] || u.source}</span>
                    <span className="text-[10px] opacity-60">{u.sourceName}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
