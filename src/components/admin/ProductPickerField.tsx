'use client';

import { useState, useCallback } from 'react';

interface ProductPickerFieldProps {
  value: string[];
  onChange: (ids: string[]) => void;
  single?: boolean;
  placeholder?: string;
  searchUrl?: string;
  /** Field mapping — defaults to product shape. Set for projects, blog, etc. */
  displayFields?: {
    name?: string;      // default: 'name'
    image?: string;     // default: 'images' (array, uses [0])
    subtitle?: string;  // default: 'brand'
    category?: string;  // default: none
    slug?: string;      // default: 'slug'
  };
}

export function ProductPickerField({ value, onChange, single, placeholder, searchUrl, displayFields }: ProductPickerFieldProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const fields = {
    name: displayFields?.name || 'name',
    image: displayFields?.image || 'images',
    subtitle: displayFields?.subtitle || 'brand',
    category: displayFields?.category || '',
    slug: displayFields?.slug || 'slug',
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearch(q);
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    try {
      const url = searchUrl || '/api/admin/search-products';
      const res = await fetch(`${url}?q=${encodeURIComponent(q)}`);
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

  const getImage = (p: any): string | null => {
    const imgField = p[fields.image];
    if (Array.isArray(imgField)) return imgField[0] || null;
    if (typeof imgField === 'string') return imgField;
    return null;
  };

  const getSubtitle = (p: any): string => {
    const val = p[fields.subtitle];
    if (!val) return '';
    if (typeof val === 'object' && val.name) return val.name;
    return String(val);
  };

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5" onClick={e => e.stopPropagation()}>
          {value.map(slug => (
            <span key={slug} className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-2.5 py-1 text-[11px] font-medium">
              <span className="text-primary">{slug}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(slug); }} className="text-[10px] text-muted hover:text-red-500 ml-1" title="Hapus">Hapus</button>
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
            placeholder={placeholder || (single ? 'Pilih...' : 'Cari untuk ditambahkan...')}
            className="w-full rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card"
          />
          {open && results.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded border border-border bg-card shadow-lg max-h-56 overflow-y-auto" onClick={e => e.stopPropagation()}>
              {results.map((p: any) => {
                const slug = p[fields.slug] || p.id;
                const selected = value.includes(slug);
                const img = getImage(p);
                const subtitle = getSubtitle(p);
                const cat = fields.category ? p[fields.category] : null;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); add(slug); }}
                    disabled={selected}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-surface disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2.5 ${selected ? 'bg-surface/50' : ''}`}
                  >
                    {img && <img src={img} alt="" className="h-8 w-8 rounded object-cover shrink-0" />}
                    <div className="min-w-0">
                      <div className="font-medium text-primary truncate">{p[fields.name]}</div>
                      {(subtitle || cat) && (
                        <div className="text-[10px] text-muted/60">
                          {cat ? `${cat}` : ''}{cat && subtitle ? ' • ' : ''}{subtitle}
                        </div>
                      )}
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
