'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProductAutocomplete } from '@/lib/hooks/useProductAutocomplete';

interface SearchBarProps {
  onFocusMobile?: () => void;
  onCloseMobile?: () => void;
  expanded?: boolean;
}

export function SearchBar({ onFocusMobile, onCloseMobile, expanded }: SearchBarProps) {
  const {
    query, suggestions, open, selected,
    inputRef, listRef,
    handleChange, handleSelect, handleKeyDown, highlight, formatPrice, clear,
  } = useProductAutocomplete();

  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [localOpen, setLocalOpen] = useState(false);
  const displayOpen = expanded ? open : (localOpen || open);

  useEffect(() => {
    if (expanded && inputRef.current) inputRef.current.focus();
  }, [expanded, inputRef]);

  const onSelect = (slug: string) => {
    setLocalOpen(false);
    onCloseMobile?.();
    router.push(`/produk/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalOpen(false);
    onCloseMobile?.();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/cari?q=${encodeURIComponent(q)}`);
  };

  const handleClear = () => { clear(); inputRef.current?.focus(); };

  return (
    <div ref={containerRef} className={`relative w-full ${expanded ? '' : 'max-w-lg'}`}>
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor={expanded ? 'header-search-mobile' : 'header-search'} className="sr-only">Cari produk</label>
        <input
          id={expanded ? 'header-search-mobile' : 'header-search'}
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => onFocusMobile?.()}
          placeholder="Cari produk..."
          className="w-full rounded-lg border border-border py-2 pl-4 pr-12 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300"
        />

        {expanded && query && (
          <button type="button" onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-primary transition" aria-label="Hapus">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {!expanded && (
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary p-1.5 text-white hover:bg-primary-hover transition-colors" aria-label="Cari">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
      </form>

      {displayOpen && suggestions.length > 0 && (
        <div ref={listRef} className={`absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-border bg-card shadow-xl max-h-96 overflow-y-auto ${expanded ? 'rounded-t-none' : ''}`}>
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.slug)}
              onMouseEnter={() => { /* handled by hook */ }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface ${i === selected ? 'bg-surface' : ''}`}
            >
              {s.images?.[0] && (
                <img src={s.images[0]} alt="" className="h-10 w-10 rounded object-contain bg-white border border-border shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-primary truncate">{highlight(s.name)}</p>
                <p className="text-xs text-muted">{s.brand?.name && <span>{s.brand.name} · </span>}{formatPrice(s.price)}</p>
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
