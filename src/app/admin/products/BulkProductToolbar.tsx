'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface BulkProductToolbarProps {
  productIds: string[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function BulkProductToolbar({ productIds, brands, categories }: BulkProductToolbarProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const count = productIds.length;

  const run = useCallback(async (action: string, payload?: Record<string, string>) => {
    if (count === 0) return;
    setSaving(true); setStatus(null);
    try {
      const fd = new FormData();
      fd.set('ids', JSON.stringify(productIds));
      fd.set('action', action);
      if (payload) Object.entries(payload).forEach(([k, v]) => fd.set(k, v));
      const res = await fetch('/api/admin/bulk-products', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', msg: json.message || 'Done' });
      } else {
        setStatus({ type: 'error', msg: json.error || 'Failed' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Network error' });
    } finally {
      setSaving(false);
      router.refresh();
    }
  }, [productIds, router, count]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-primary">{count} selected</span>
      <div className="h-5 w-px bg-border" />

      <button onClick={() => run('publish')} disabled={saving}
        className="rounded border border-green-200 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50">Publish</button>
      <button onClick={() => run('archive')} disabled={saving}
        className="rounded border border-border px-3 py-1 text-xs font-medium text-muted hover:bg-surface disabled:opacity-50">Archive</button>

      {showCategoryPicker ? (
        <select onChange={e => { if (e.target.value) run('changeCategory', { categoryId: e.target.value }); setShowCategoryPicker(false); }}
          className="rounded border border-border px-2 py-1 text-xs bg-card" defaultValue="">
          <option value="">Change category...</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      ) : showBrandPicker ? (
        <select onChange={e => { if (e.target.value) run('changeBrand', { brandId: e.target.value }); setShowBrandPicker(false); }}
          className="rounded border border-border px-2 py-1 text-xs bg-card" defaultValue="">
          <option value="">Change brand...</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      ) : (
        <>
          <button onClick={() => setShowCategoryPicker(true)}
            className="rounded border border-border px-3 py-1 text-xs font-medium text-muted hover:bg-surface">Category</button>
          <button onClick={() => setShowBrandPicker(true)}
            className="rounded border border-border px-3 py-1 text-xs font-medium text-muted hover:bg-surface">Brand</button>
        </>
      )}

      <div className="h-5 w-px bg-border" />
      <button onClick={() => { if (confirm(`Delete ${count} products?`)) run('delete'); }} disabled={saving}
        className="rounded border border-red-200 px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-50">Delete</button>

      {status && (
        <span className={`text-xs font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{status.msg}</span>
      )}
    </div>
  );
}
