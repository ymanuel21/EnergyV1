'use client';

import { useState, useCallback } from 'react';

interface ProductPickerFieldProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function ProductPickerField({ value, onChange }: ProductPickerFieldProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const res = await fetch(`/api/admin/search-products?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.products || data || []);
      setOpen(true);
    } catch { setResults([]); }
  }, []);

  const add = useCallback((slug: string) => {
    if (!value.includes(slug)) {
      onChange([...value, slug]);
    }
    setSearch('');
    setResults([]);
    setOpen(false);
  }, [value, onChange]);

  const remove = useCallback((slug: string) => {
    onChange(value.filter(id => id !== slug));
  }, [value, onChange]);

  // Fetch product names for selected slugs
  const [names, setNames] = useState<Record<string, string>>({});

  const resolveNames = useCallback(async (slugs: string[]) => {
    if (slugs.length === 0) return;
    try {
      const res = await fetch(`/api/admin/search-products?q=${encodeURIComponent(slugs.join(','))}&limit=${slugs.length}`);
      const data = await res.json();
      const list = data.products || data || [];
      const map: Record<string, string> = {};
      for (const p of list) map[p.slug] = p.name;
      setNames(prev => ({ ...prev, ...map }));
    } catch {}
  }, []);

  // Trigger name resolution when value changes
  if (value.length > 0 && Object.keys(names).length === 0) {
    resolveNames(value);
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Cari produk..."
          className="w-full rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card"
        />
        {open && results.length > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded border border-border bg-card shadow-lg max-h-48 overflow-y-auto">
            {results.map((p: any) => (
              <button
                key={p.slug || p.id}
                type="button"
                onClick={() => add(p.slug || p.id)}
                disabled={value.includes(p.slug || p.id)}
                className="w-full px-3 py-2 text-left text-xs hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {p.name} {value.includes(p.slug || p.id) && '✓'}
              </button>
            ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(slug => (
            <span key={slug} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium">
              {names[slug] || slug}
              <button type="button" onClick={() => remove(slug)} className="text-muted hover:text-red-500">×</button>
            </span>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted">Search and select products. Drag to reorder coming soon.</p>
    </div>
  );
}
