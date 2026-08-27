'use client';

import { useState, useEffect, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BulkProductToolbar } from './BulkProductToolbar';
import { ImportModal } from './ImportModal';
import { VisibilityToggle } from '@/components/admin/VisibilityToggle';

// Module-level: track back/forward navigation so the list restores scroll only when returning.
let didNavigateBack = false;
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => { didNavigateBack = true; });
}

function productScrollKey() {
  return `products-scroll:${window.location.pathname}${window.location.search}`;
}

interface ProductTableProps {
  products: any[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string; children?: { id: string; name: string }[] }[];
  currentBrand?: string;
  currentCategory?: string;
}

export function ProductTable({ products, brands, categories, currentBrand, currentCategory }: ProductTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showImport, setShowImport] = useState(false);

  // Restore scroll position when returning to the list via Back (keyed by URL so each
  // Brand/Category-filtered list keeps its own position). Runs before paint to avoid a flash.
  useLayoutEffect(() => {
    if (!didNavigateBack) return;
    didNavigateBack = false;
    const saved = sessionStorage.getItem(productScrollKey());
    if (saved) window.scrollTo(0, parseInt(saved, 10));
  }, []);

  // Persist scroll position (throttled via requestAnimationFrame) while on the list.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        sessionStorage.setItem(productScrollKey(), String(window.scrollY));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const applyFilter = (brand: string, category: string) => {
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (category) params.set('category', category);
    const qs = params.toString();
    router.replace(qs ? `/admin/products?${qs}` : '/admin/products');
  };

  // Flatten categories (parents + children) for the filter dropdown.
  const flatCategories = categories.flatMap((c) => [
    { id: c.id, name: c.name, depth: 0 },
    ...(c.children || []).map((ch) => ({ id: ch.id, name: ch.name, depth: 1 })),
  ]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    setSelected(selected.size === products.length ? new Set() : new Set(products.map((p: any) => p.id)));
  };

  const allIds = products.map((p: any) => p.id);
  const count = selected.size;
  const selectedIds = [...selected];

  // Build export URL with selected slugs
  const exportUrl = selected.size > 0
    ? `/api/admin/products/export-xlsx?ids=${selectedIds.join(',')}`
    : '/api/admin/products/export-xlsx';

  return (
    <div>
      {/* Top bar: Export / Import */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">Produk</h1>
        <div className="flex items-center gap-3">
          <a href={exportUrl} className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface transition">
            📥 Export Excel (.xlsx)
          </a>
          <button onClick={() => setShowImport(true)} className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface transition">
            📤 Import Excel (.xlsx)
          </button>
          <Link href="/admin/products/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
            + Tambah Produk
          </Link>
        </div>
      </div>

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <select
          value={currentBrand || ''}
          onChange={(e) => applyFilter(e.target.value, currentCategory || '')}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary"
          aria-label="Filter brand"
        >
          <option value="">Semua Brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={currentCategory || ''}
          onChange={(e) => applyFilter(currentBrand || '', e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-primary"
          aria-label="Filter kategori"
        >
          <option value="">Semua Kategori</option>
          {flatCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.depth ? `\u00A0\u00A0\u00A0${c.name}` : c.name}
            </option>
          ))}
        </select>

        {(currentBrand || currentCategory) && (
          <button
            onClick={() => applyFilter('', '')}
            className="text-sm text-primary hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card">
        {/* Toolbar */}
        <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={toggleAll}
              className="rounded border-border text-primary focus:ring-primary" />
            <span className="text-sm text-muted">{count > 0 ? `${count} selected` : 'Select all'}</span>
          </label>

          {count > 0 && (
            <BulkProductToolbar productIds={selectedIds} brands={brands} categories={categories} />
          )}
        </div>

        {/* Table */}
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-muted">
            <tr>
              <th className="w-10 px-4 py-3" />
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {products.map((p: any) => (
              <tr key={p.id} className={`hover:bg-surface/50 transition ${selected.has(p.id) ? 'bg-primary/5' : ''}`}>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)}
                    className="rounded border-border text-primary focus:ring-primary" />
                </td>
                <td className="px-4 py-3 font-medium text-primary">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-primary-hover">{p.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted">{p.brand?.name ?? '—'}</td>
                <td className="px-4 py-3 text-primary font-medium">Rp {p.price?.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-muted">{p.stock}</td>
                <td className="px-4 py-3">
                  <VisibilityToggle id={p.id} active={p.isActive} endpoint="/api/admin/products/toggle-active" />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-primary hover:underline text-xs">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="py-12 text-center text-muted text-sm">No products yet.</div>
        )}
      </div>
    </div>
  );
}
