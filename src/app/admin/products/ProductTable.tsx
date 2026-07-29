'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BulkProductToolbar } from './BulkProductToolbar';

interface ProductTableProps {
  products: any[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function ProductTable({ products, brands, categories }: ProductTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    setSelected(selected.size === products.length ? new Set() : new Set(products.map((p: any) => p.id)));
  };

  const productIds = products.map((p: any) => p.id);
  const count = selected.size;

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={toggleAll}
            className="rounded border-border text-primary focus:ring-primary" />
          <span className="text-sm text-muted">{count > 0 ? `${count} selected` : 'Select all'}</span>
        </label>

        {count > 0 && (
          <BulkProductToolbar productIds={productIds} brands={brands} categories={categories} />
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
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-surface text-muted'}`}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
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
  );
}
