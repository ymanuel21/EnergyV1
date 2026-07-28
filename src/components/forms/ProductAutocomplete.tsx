'use client';

import { useProductAutocomplete } from '@/lib/hooks/useProductAutocomplete';

interface ProductAutocompleteProps {
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  onSelect?: (product: { name: string; slug: string }) => void;
  className?: string;
}

export function ProductAutocomplete({
  id = 'product-search',
  name = 'productName',
  placeholder = 'Cari produk...',
  required = false,
  onSelect,
  className = '',
}: ProductAutocompleteProps) {
  const {
    query, suggestions, open, selected, setOpen, setSelected,
    inputRef, listRef,
    handleChange, handleSelect, handleKeyDown, highlight, formatPrice,
  } = useProductAutocomplete({
    onSelect: (s) => onSelect?.({ name: s.name, slug: s.slug }),
  });

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls="product-suggestions"
        aria-activedescendant={selected >= 0 ? `suggestion-${selected}` : undefined}
        aria-required={required}
        required={required}
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
      />

      {open && suggestions.length > 0 && (
        <div
          ref={listRef}
          id="product-suggestions"
          role="listbox"
          className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-card shadow-xl"
        >
          {suggestions.map((s, i) => (
            <div
              key={s.id}
              id={`suggestion-${i}`}
              role="option"
              aria-selected={i === selected}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setSelected(i)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-surface ${i === selected ? 'bg-surface' : ''}`}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
