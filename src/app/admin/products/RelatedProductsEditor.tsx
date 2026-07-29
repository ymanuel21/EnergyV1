'use client';

import { useState, useEffect } from 'react';

interface RelatedProduct {
  id: string;
  productId: string;
  relatedProductId: string;
  type: string;
  relatedProduct?: { id: string; name: string; price: number; brand?: { name: string } };
}

interface RelatedProductsEditorProps {
  value: RelatedProduct[];
  onChange: (value: RelatedProduct[]) => void;
  currentProductId: string;
}

const TYPE_LABELS: Record<string, string> = {
  recommended: '⭐ Recommended',
  alternative: '🔄 Alternative',
  accessory: '🔧 Accessory',
};

export function RelatedProductsEditor({ value, onChange, currentProductId }: RelatedProductsEditorProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/search-products?q=${encodeURIComponent(search)}&exclude=${currentProductId}`);
        const data = await res.json();
        setResults(data.slice(0, 10));
      } catch { setResults([]); }
      setSearching(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, currentProductId]);

  const add = (product: any, type: string) => {
    // Avoid duplicates
    if (value.some(r => r.relatedProductId === product.id)) return;
    onChange([...value, {
      id: '', productId: currentProductId, relatedProductId: product.id, type,
      relatedProduct: { id: product.id, name: product.name, price: product.price, brand: product.brand },
    }]);
    setSearch('');
    setResults([]);
  };

  const updateType = (relatedProductId: string, type: string) => {
    onChange(value.map(r => r.relatedProductId === relatedProductId ? { ...r, type } : r));
  };

  const remove = (relatedProductId: string) => {
    onChange(value.filter(r => r.relatedProductId !== relatedProductId));
  };

  const byType = (type: string) => value.filter(r => r.type === type);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-muted mb-1">Search product to link</label>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Type product name..."
          className="w-full rounded border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card" />
        {searching && <p className="text-[10px] text-muted mt-1">Searching...</p>}
        {results.length > 0 && (
          <div className="mt-1 rounded-lg border border-border bg-card divide-y divide-border max-h-48 overflow-y-auto">
            {results.map((p: any) => (
              <div key={p.id} className="px-3 py-2 flex items-center justify-between hover:bg-surface text-sm">
                <div className="min-w-0">
                  <p className="text-primary truncate">{p.name}</p>
                  <p className="text-[10px] text-muted">{p.brand?.name}{p.price ? ` · Rp ${p.price?.toLocaleString('id-ID')}` : ''}</p>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  {['recommended', 'alternative', 'accessory'].map(type => (
                    <button key={type} type="button" onClick={() => add(p, type)}
                      className="rounded border border-border px-2 py-0.5 text-[10px] text-muted hover:border-primary hover:text-primary transition">
                      {type === 'recommended' ? '⭐' : type === 'alternative' ? '🔄' : '🔧'}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {search.trim() && !searching && results.length === 0 && (
          <p className="text-[10px] text-muted mt-1">No products found.</p>
        )}
      </div>

      {/* Linked products by type */}
      {(['recommended', 'alternative', 'accessory'] as const).map(type => {
        const items = byType(type);
        if (items.length === 0) return null;
        return (
          <div key={type}>
            <p className="text-xs font-medium text-primary mb-2">{TYPE_LABELS[type]}</p>
            <div className="space-y-1.5">
              {items.map(r => (
                <div key={r.relatedProductId} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 group hover:bg-surface/30 transition">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary truncate">{r.relatedProduct?.name || r.relatedProductId}</p>
                    <p className="text-[10px] text-muted">
                      {r.relatedProduct?.brand?.name}{r.relatedProduct?.price ? ` · Rp ${r.relatedProduct.price.toLocaleString('id-ID')}` : ''}
                    </p>
                  </div>
                  <select value={r.type} onChange={e => updateType(r.relatedProductId, e.target.value)}
                    className="rounded border border-border px-2 py-1 text-[10px] bg-card focus:border-primary outline-none">
                    <option value="recommended">Recommended</option>
                    <option value="alternative">Alternative</option>
                    <option value="accessory">Accessory</option>
                  </select>
                  <button type="button" onClick={() => remove(r.relatedProductId)}
                    className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition text-xs">✕</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
