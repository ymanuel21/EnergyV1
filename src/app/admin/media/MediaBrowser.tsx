'use client';

import { useState } from 'react';
import type { MediaItem } from './actions';

const SOURCE_LABELS: Record<string, string> = {
  product: 'Produk',
  project: 'Proyek',
  brand: 'Brand',
  banner: 'Banner',
  testimonial: 'Testimoni',
  homepage: 'Homepage',
};

export function MediaBrowser({ items }: { items: MediaItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const selectedItem = items.find(i => i.id === selected);

  function handleCopy(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg('URL copied!');
      setTimeout(() => setCopyMsg(null), 2000);
    });
  }

  if (!items.length) return <p className="text-muted text-sm py-8 text-center">No assets found.</p>;

  return (
    <div>
      {copyMsg && (
        <div className="mb-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{copyMsg}</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map(a => (
          <div key={a.id}
            className={`rounded-lg border bg-card overflow-hidden transition cursor-pointer ${selected === a.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            onClick={() => setSelected(selected === a.id ? null : a.id)}>
            <div className="aspect-square flex items-center justify-center bg-surface">
              <img src={a.url} alt={a.name} className="max-h-full max-w-full object-contain p-2" />
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
