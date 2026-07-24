'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImageUpload } from '../ImageUpload';
import { SlugInput } from '../SlugInput';

interface ProductFormProps {
  defaultValues?: any;
  brands: any[];
  categories: any[];
  onSubmit: (data: any) => Promise<void>;
}

export function ProductForm({ defaultValues, brands, categories, onSubmit }: ProductFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const data: any = {
      name: form.get('name'),
      slug: form.get('slug'),
      price: parseInt(form.get('price') as string) || 0,
      originalPrice: parseInt(form.get('originalPrice') as string) || null,
      stock: parseInt(form.get('stock') as string) || 0,
      sku: form.get('sku') || null,
      description: form.get('description'),
      images: [form.get('image') || '/images/placeholder/product-placeholder.png'],
      badges: form.get('badges') ? (form.get('badges') as string).split(',').map((s: string) => s.trim()) : [],
      brandId: form.get('brandId'),
      categoryId: form.get('categoryId'),
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
          <input name="name" defaultValue={defaultValues?.name} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
          <SlugInput name="slug" defaultValue={defaultValues?.slug} sourceName="name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Harga *</label>
          <input name="price" type="number" defaultValue={defaultValues?.price} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Harga Asli</label>
          <input name="originalPrice" type="number" defaultValue={defaultValues?.originalPrice} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
          <input name="stock" type="number" defaultValue={defaultValues?.stock ?? 0} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input name="sku" defaultValue={defaultValues?.sku} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
          <select name="brandId" defaultValue={defaultValues?.brandId} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Pilih Brand</option>
            {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
          <select name="categoryId" defaultValue={defaultValues?.categoryId} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="">Pilih Kategori</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <ImageUpload name="image" defaultValue={defaultValues?.images?.[0]} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Badges (comma separated)</label>
          <input name="badges" defaultValue={defaultValues?.badges?.join(',')} placeholder="clearance, promo, new, cheapest" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
          <select name="condition" defaultValue={defaultValues?.condition ?? 'new'} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
            <option value="new">Baru</option>
            <option value="new-minor-defect">Baru - Minor Defect</option>
            <option value="new-project-leftover">Baru - Sisa Proyek</option>
            <option value="open-box">Open Box</option>
            <option value="display">Display</option>
            <option value="used">Bekas</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Garansi</label>
          <input name="warranty" defaultValue={defaultValues?.warranty ?? '1 Tahun'} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Berat (kg)</label>
          <input name="weight" type="number" step="0.1" defaultValue={defaultValues?.weight ?? 0} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea name="description" rows={4} defaultValue={defaultValues?.description} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Batal
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
