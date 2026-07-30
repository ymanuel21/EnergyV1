'use client';

import { useState, useCallback } from 'react';

interface ProductPickerFieldProps {
  value: string[];
  onChange: (ids: string[]) => void;
  /** Limit to single product selection */
  single?: boolean;
}

export function ProductPickerField({ value, onChange, single = false }: ProductPickerFieldProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    try {
      const res = await fetch(`/api/admin/search-products?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults((data.products || data || []).slice(0, 8));
      setOpen(true);
    } catch { setResults([]); }
  }, []);

  const add = useCallback((slug: string) => {
    if (single) {
      onChange([slug]);
    } else if (!value.includes(slug)) {
      onChange([...value, slug]);
    }
    setSearch('');
    setResults([]);
    setOpen(false);
  }, [value, onChange, single]);

  const remove = useCallback((slug: string) => {
    onChange(value.filter(id => id !== slug));
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      {/* Selected product chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
          {value.map(slug => (
            <span key={slug} className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-2.5 py-1 text-[11px] font-medium">
              <span className="text-primary">{slug}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(slug); }} className="text-muted hover:text-red-500 text-xs leading-none">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      {(single ? value.length === 0 : true) && (
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            placeholder={single ? 'Cari produk...' : 'Cari produk untuk ditambahkan...'}
            className="w-full rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card"
          />
          {open && results.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded border border-border bg-card shadow-lg max-h-56 overflow-y-auto" onClick={e => e.stopPropagation()}>
              {results.map((p: any) => {
                const slug = p.slug || p.id;
                const selected = value.includes(slug);
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(slug); }}
                    disabled={selected}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 ${selected ? 'bg-surface/50' : ''}`}
                  >
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-primary truncate">{p.name}</div>
                      {p.brand && <div className="text-[10px] text-muted/60">{p.brand}</div>}
                    </div>
                    {selected && <span className="shrink-0 text-green-600 text-xs ml-auto">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
