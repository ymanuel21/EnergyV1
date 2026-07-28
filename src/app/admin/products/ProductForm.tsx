'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MultiImageUpload } from '../MultiImageUpload';
import { SlugInput } from '../SlugInput';
import { CurrencyInput } from '../CurrencyInput';
import { BadgeSelector } from '../BadgeSelector';

interface ProductFormProps {
  defaultValues?: any;
  brands: any[];
  categories: any[];
  onSubmit: (data: any) => Promise<void>;
}

function ReqStar() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

export function ProductForm({ defaultValues, brands, categories, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Pre-select categories from ProductCategory relation or legacy categoryId
  const defaultCatIds: string[] = defaultValues?.categories?.map((pc: any) => pc.categoryId)
    || (defaultValues?.categoryId ? [defaultValues.categoryId] : []);

  const topCategories = categories.filter((c: any) => !c.parentId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget as HTMLFormElement);

    // Collect all checked category IDs
    const categoryIds = categories
      .filter((c: any) => form.get(`cat-${c.id}`) === 'on')
      .map((c: any) => c.id);

    const data: any = {
      name: form.get('name'),
      slug: form.get('slug'),
      price: parseInt(form.get('price') as string) || 0,
      originalPrice: parseInt(form.get('originalPrice') as string) || null,
      stock: parseInt(form.get('stock') as string) || 0,
      sku: form.get('sku') || null,
      description: form.get('description'),
      images: (() => {
        const raw = form.get('images') as string;
        if (!raw) return ['/images/placeholder/product-placeholder.png'];
        try {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) && parsed.length > 0 ? parsed : ['/images/placeholder/product-placeholder.png'];
        } catch {
          return [raw || '/images/placeholder/product-placeholder.png'];
        }
      })(),
      badges: [],
      badgeIds: [],
      brandId: form.get('brandId'),
      categoryIds,
      categoryId: categoryIds[0] || null, // Legacy single category for backward compat
      condition: form.get('condition') || 'new',
      warranty: form.get('warranty') || '1 Tahun',
      weight: parseFloat(form.get('weight') as string) || 0,
      specifications: [],
      affiliateCommission: { percent: 2.5, amount: Math.round((parseInt(form.get('price') as string) || 0) * 0.025) },
      isActive: true,
    };
    await onSubmit(data);
    setSaving(false);
    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Nama Produk <ReqStar /></label>
          <input name="name" defaultValue={defaultValues?.name} required className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Slug <ReqStar /></label>
          <SlugInput name="slug" defaultValue={defaultValues?.slug} sourceName="name" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
        <CurrencyInput name="price" label="Harga" required defaultValue={defaultValues?.price} />
        </div>
        <div>
        <CurrencyInput name="originalPrice" label="Harga Asli" defaultValue={defaultValues?.originalPrice ?? undefined} />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Stok <ReqStar /></label>
          <input name="stock" type="number" defaultValue={defaultValues?.stock ?? 0} required className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">SKU</label>
          <input name="sku" defaultValue={defaultValues?.sku} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Brand <ReqStar /></label>
          <select name="brandId" defaultValue={defaultValues?.brandId} required className="w-full rounded-lg border border-border px-3 py-2 text-sm">
            <option value="">Pilih Brand</option>
            {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Kategori <ReqStar /></label>
          <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-border p-3 bg-card">
            {topCategories.length === 0 && <p className="text-xs text-muted">Tidak ada kategori</p>}
            {topCategories.map((cat: any) => (
              <div key={cat.id}>
                <label className="flex items-center gap-2 py-0.5 cursor-pointer">
                  <input
                    type="checkbox"
                    name={`cat-${cat.id}`}
                    defaultChecked={defaultCatIds.includes(cat.id)}
                    className="rounded border-border text-gray-800 focus:ring-gray-700"
                  />
                  <span className="text-sm font-medium text-primary">{cat.name}</span>
                </label>
                {/* Children */}
                {cat.children?.map((child: any) => (
                  <label key={child.id} className="flex items-center gap-2 py-0.5 pl-6 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`cat-${child.id}`}
                      defaultChecked={defaultCatIds.includes(child.id)}
                      className="rounded border-border text-gray-800 focus:ring-gray-700"
                    />
                    <span className="text-sm text-muted">{child.name}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
        <MultiImageUpload name="images" label="Gambar Produk" defaultValue={defaultValues?.images || []} />
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Badges</label>
          <BadgeSelector defaultBadgeIds={defaultValues?.badges || []} />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Kondisi</label>
          <select name="condition" defaultValue={defaultValues?.condition ?? 'new'} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
            <option value="new">Baru</option>
            <option value="new-minor-defect">Baru - Minor Defect</option>
            <option value="new-project-leftover">Baru - Sisa Proyek</option>
            <option value="open-box">Open Box</option>
            <option value="display">Display</option>
            <option value="used">Bekas</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Garansi</label>
          <input name="warranty" defaultValue={defaultValues?.warranty ?? '1 Tahun'} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">Berat (kg)</label>
          <input name="weight" type="number" step="0.1" defaultValue={defaultValues?.weight ?? 0} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-primary mb-1">Deskripsi</label>
        <textarea name="description" rows={4} defaultValue={defaultValues?.description} className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface">
          Batal
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
