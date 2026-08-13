'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface ProductSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  sku?: string | null;
  model?: string | null;
  capacity?: string | null;
  brand: { name: string; slug: string } | null;
}

interface UseProductAutocompleteOptions {
  debounceMs?: number;
  limit?: number;
  onSelect?: (suggestion: ProductSuggestion) => void;
}

export function useProductAutocomplete({ debounceMs = 200, limit = 8, onSelect }: UseProductAutocompleteOptions = {}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) { setSuggestions([]); setOpen(false); return; }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.slice(0, limit));
      setOpen(data.length > 0);
      setSelected(-1);
    } catch { setSuggestions([]); }
  }, [limit]);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), debounceMs);
  }, [debounceMs, fetchSuggestions]);

  const handleSelect = useCallback((suggestion: ProductSuggestion) => {
    setQuery(suggestion.name);
    setOpen(false);
    onSelect?.(suggestion);
  }, [onSelect]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, -1)); }
    else if (e.key === 'Enter' && selected >= 0) { e.preventDefault(); handleSelect(suggestions[selected]); }
    else if (e.key === 'Escape') setOpen(false);
  }, [open, selected, suggestions, handleSelect]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (listRef.current && !listRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const highlight = useCallback((text: string) => {
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
  }, [query]);

  const formatPrice = useCallback((price: number) => 'Rp ' + price.toLocaleString('id-ID'), []);

  const clear = useCallback(() => { setQuery(''); setSuggestions([]); setOpen(false); }, []);

  return {
    query, setQuery, suggestions, open, setOpen, selected, setSelected,
    inputRef, listRef,
    handleChange, handleSelect, handleKeyDown, highlight, formatPrice, clear,
  };
}
