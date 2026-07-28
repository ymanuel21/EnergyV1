'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Suggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  brand: { name: string; slug: string } | null;
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) { setSuggestions([]); setOpen(false); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
      setOpen(data.length > 0);
      setSelected(-1);
    } catch { setSuggestions([]); }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 200);
  };

  const handleSelect = (slug: string) => {
    setOpen(false);
    router.push(`/produk/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/cari?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, -1)); }
    else if (e.key === 'Enter' && selected >= 0) { e.preventDefault(); handleSelect(suggestions[selected].slug); }
    else if (e.key === 'Escape') setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Highlight matching text
  const highlight = (text: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-primary rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  const formatPrice = (price: number) => 'Rp ' + price.toLocaleString('id-ID');

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <form onSubmit={handleSubmit}>
        <label htmlFor="header-search" className="sr-only">Cari produk</label>
        <input
          id="header-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder="Cari produk..."
          className="w-full rounded-lg border border-border py-2 pl-4 pr-12 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
        <button type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-1.5 text-white hover:bg-primary-hover transition-colors"
          aria-label="Cari">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Autocomplete dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-card shadow-xl max-h-96 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.slug)}
              onMouseEnter={() => setSelected(i)}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface ${i === selected ? 'bg-surface' : ''}`}
            >
              {s.images?.[0] && (
                <img src={s.images[0]} alt="" className="h-10 w-10 rounded object-contain bg-white border border-border shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary truncate">{highlight(s.name)}</p>
                <p className="text-xs text-muted">
                  {s.brand?.name && <span>{s.brand.name} · </span>}
                  {formatPrice(s.price)}
                </p>
              </div>
              <svg className="h-4 w-4 shrink-0 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
