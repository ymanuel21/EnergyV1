'use client';

import { useState, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';
import { SlugInput } from '../SlugInput';
import { CurrencyInput } from '../CurrencyInput';
import { BadgeSelector } from '../BadgeSelector';
import { SpecEditor } from './SpecEditor';
import { ImageGallery } from './ImageGallery';
import { DownloadManager } from './DownloadManager';
import { RelatedProductsEditor } from './RelatedProductsEditor';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { saveDraft, publishEntity } from '@/lib/services/content-versioning';
import { submitForReview } from '@/lib/services/review';
import { productReducer, makeInitialState, buildPayload } from './productReducer';
import type { ProductState, ProductAction } from './productReducer';

/* ═══════════════════════════════════════
   ProductForm — tabbed enterprise editor
   ═══════════════════════════════════════ */

const TABS = ['Overview', 'Media', 'Pricing', 'Specifications', 'Downloads', 'Related', 'SEO'] as const;
type Tab = typeof TABS[number];

interface ProductFormProps {
  defaultValues?: any;
  brands: any[];
  categories: any[];
  onSubmit: (data: any) => Promise<void>;
  reviewStatus?: string | null;
  reviewNotes?: string | null;
}

export function ProductForm({ defaultValues, brands, categories, onSubmit, reviewStatus, reviewNotes }: ProductFormProps) {
  console.log('[FORM] rendering, productId:', defaultValues?.id, 'status:', defaultValues?.status);

  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');

  const [state, dispatch] = useReducer(productReducer, defaultValues, makeInitialState);

  const defaultCatIds: string[] = defaultValues?.categories?.map((pc: any) => pc.categoryId)
    || (defaultValues?.categoryId ? [defaultValues.categoryId] : []);
  const topCategories = categories.filter((c: any) => !c.parentId);

  const productId = defaultValues?.id;
  const isDirty = Object.values(state.dirtySections).some(Boolean);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = buildPayload(state, productId);

    try {
    if (productId) {
      await saveDraft({ entity: 'product', id: productId, data });
      setSaving(false); setSaveState('saved');
      showToast('✓ Draft berhasil disimpan', 'success');
      router.refresh();
    } else {
      await onSubmit(data);
      setSaving(false); 
      showToast('✓ Produk berhasil dibuat', 'success');
      router.push('/admin/products'); router.refresh();
    }
    } catch {
      setSaving(false);
      showToast('✕ Gagal menyimpan', 'error');
    }
  }, [productId, buildPayload, state, onSubmit, router, showToast]);

  const handlePublish = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setSaving(true);
    const data = buildPayload(state, productId);
    try {
    await saveDraft({ entity: 'product', id: productId, data });
    await publishEntity({ entity: 'product', id: productId });
    setSaving(false); 
    showToast('✓ Produk berhasil dipublikasikan', 'success');
    router.push('/admin/products'); router.refresh();
    } catch {
      setSaving(false);
      showToast('✕ Gagal mempublikasikan', 'error');
    }
  }, [productId, buildPayload, state, router, showToast]);

  const handleSubmitForReview = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setSaving(true);
    const data = buildPayload(state, productId);
    try {
    await saveDraft({ entity: 'product', id: productId, data });
    await submitForReview('product', productId);
    setSaving(false); 
    showToast('✓ Produk berhasil dikirim untuk review', 'success');
    router.refresh();
    } catch {
      setSaving(false);
      showToast('✕ Gagal mengirim review', 'error');
    }
  }, [productId, buildPayload, state, router, showToast]);

  const inputCls = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';

  return (
    <form onSubmit={handleSubmit}>

      {/* ── Tab Bar ── */}
      <div className="flex gap-0 border-b border-border mb-6 -mx-6 px-6">
        {TABS.map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === 'Overview' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Nama Produk <span className="text-red-500">*</span></label>
              <input name="name" value={state.overview.name} onChange={e => dispatch({ type: 'SET_NAME', value: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Slug <span className="text-red-500">*</span></label>
              <SlugInput name="slug" defaultValue={defaultValues?.slug} sourceName="name" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Brand <span className="text-red-500">*</span></label>
              <select name="brandId" value={state.overview.brandId} onChange={e => dispatch({ type: "SET_BRAND_ID", value: e.target.value })} required className={inputCls}>
                <option value="">Pilih Brand</option>
                {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Kategori <span className="text-red-500">*</span></label>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-3 bg-card space-y-1">
                {topCategories.length === 0 && <p className="text-xs text-muted">Tidak ada kategori</p>}
                {topCategories.map((cat: any) => (
                  <div key={cat.id}>
                    <label className="flex items-center gap-2 py-0.5 cursor-pointer"><input type="checkbox" name={`cat-${cat.id}`} defaultChecked={defaultCatIds.includes(cat.id)} className="rounded border-border" /><span className="text-sm font-medium text-primary">{cat.name}</span></label>
                    {cat.children?.map((child: any) => (
                      <label key={child.id} className="flex items-center gap-2 py-0.5 pl-6 cursor-pointer"><input type="checkbox" name={`cat-${child.id}`} defaultChecked={defaultCatIds.includes(child.id)} className="rounded border-border" /><span className="text-sm text-muted">{child.name}</span></label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">SKU</label>
              <input name="sku" value={state.overview.sku} onChange={e => dispatch({ type: "SET_SKU", value: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Stok <span className="text-red-500">*</span></label>
              <input name="stock" type="number" value={state.overview.stock} onChange={e => dispatch({ type: "SET_STOCK", value: parseInt(e.target.value) || 0 })} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Kondisi</label>
              <select name="condition" value={state.overview.condition} onChange={e => dispatch({ type: 'SET_CONDITION', value: e.target.value })} className={inputCls}>
                <option value="new">Baru</option><option value="new-minor-defect">Baru — Minor Defect</option>
                <option value="new-project-leftover">Baru — Sisa Proyek</option><option value="open-box">Open Box</option>
                <option value="display">Display</option><option value="used">Bekas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Garansi</label>
              <input name="warranty" value={state.overview.warranty} onChange={e => dispatch({ type: 'SET_WARRANTY', value: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary mb-1">Berat (kg)</label>
              <input name="weight" type="number" step="0.1" value={state.overview.weight} onChange={e => dispatch({ type: "SET_WEIGHT", value: parseFloat(e.target.value) || 0 })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Deskripsi</label>
            <textarea name="description" rows={4} value={state.overview.description} onChange={e => dispatch({ type: "SET_DESCRIPTION", value: e.target.value })} className={inputCls + ' resize-y'} />
          </div>
        </div>
      )}

      {/* ── Media Tab ── */}
      {activeTab === 'Media' && (
        <div className="space-y-6">
          <ImageGallery images={state.media.images} onChange={v => dispatch({ type: 'SET_IMAGES', value: v })} />
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium text-primary mb-2">Badges</p>
            <BadgeSelector
              value={state.media.badges}
              onChange={(badges) => dispatch({ type: 'SET_BADGES', value: badges })}
            />
          </div>
        </div>
      )}

      {/* ── Pricing Tab ── */}
      {activeTab === 'Pricing' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <CurrencyInput name="price" label="Harga" required defaultValue={defaultValues?.price} />
          <CurrencyInput name="originalPrice" label="Harga Asli (coret)" defaultValue={defaultValues?.originalPrice ?? undefined} />
          
          <div className="sm:col-span-2 border-t border-border pt-4">
            <label className="block text-sm font-medium text-primary mb-2">Price Display Mode</label>
            <select name="priceDisplayMode" value={state.pricing.priceDisplayMode} onChange={e => dispatch({ type: 'SET_PRICE_DISPLAY_MODE', value: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm">
              <option value="">Use Global Setting</option>
              <option value="SHOW_PRICE">Show Price</option>
              <option value="STARTING_FROM">Starting From</option>
              <option value="CONTACT_FOR_PRICE">Contact for Price</option>
              <option value="REQUEST_QUOTE">Request Quote</option>
              <option value="CUSTOM_TEXT">Custom Text</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-primary mb-1">Custom Price Label</label>
            <input name="customPriceLabel" value={state.pricing.customPriceLabel} onChange={e => dispatch({ type: 'SET_CUSTOM_PRICE_LABEL', value: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 text-sm" placeholder="Digunakan saat mode Custom Text dipilih" />
          </div>

          <div className="sm:col-span-2 p-4 rounded-lg bg-surface text-xs text-muted">
            <p className="font-medium text-primary mb-1">💡 Tip</p>
            <p>Biarkan Harga Asli kosong jika tidak ada diskon. Isi untuk menampilkan harga coret di halaman produk. Price Display Mode mengontrol bagaimana harga ditampilkan ke publik — pilih "Use Global Setting" untuk mengikuti pengaturan default.</p>
          </div>
        </div>
      )}

      {/* ── Specifications Tab ── */}
      {activeTab === 'Specifications' && (
        <SpecEditor value={state.specifications} onChange={v => dispatch({ type: 'SET_SPECS', value: v })} />
      )}

      {/* ── Downloads Tab ── */}
      {activeTab === 'Downloads' && (
        <DownloadManager value={state.downloads as any} onChange={v => dispatch({ type: 'SET_DOWNLOADS', value: v })} />
      )}

      {/* ── Related Tab ── */}
      {activeTab === 'Related' && (
        <RelatedProductsEditor value={state.related as any} onChange={v => dispatch({ type: 'SET_RELATIONS', value: v })} currentProductId={defaultValues?.id || ''} />
      )}

      {/* ── SEO Tab ── */}
      {activeTab === 'SEO' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">SEO Title</label>
            <input name="seoTitle" value={state.seo.seoTitle} onChange={e => dispatch({ type: 'SET_SEO_TITLE', value: e.target.value })} className={inputCls} placeholder={defaultValues?.name ? `${defaultValues.name} | EBTPlaza` : 'Nama Produk | EBTPlaza'} />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Meta Description</label>
            <textarea name="metaDescription" rows={3} value={state.seo.metaDescription} onChange={e => dispatch({ type: 'SET_META_DESCRIPTION', value: e.target.value })} className={inputCls + ' resize-y'} placeholder="Deskripsi singkat produk untuk hasil pencarian (120-160 karakter)" />
          </div>
          <div className="p-4 rounded-lg bg-surface text-xs text-muted">
            <p className="font-medium text-primary mb-1">💡 SEO</p>
            <p>Title muncul di tab browser & hasil Google. Meta description adalah ringkasan yang muncul di bawah judul hasil pencarian.</p>
          </div>
        </div>
      )}

      {/* ── Sticky Save Bar with Review Workflow ── */}
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 px-6 py-4 bg-card border-t border-border flex items-center justify-between rounded-b-xl">
        <div className="flex items-center gap-3">
          <StatusBadge status={
            reviewStatus === 'pending' ? 'review_pending' :
            reviewStatus === 'approved' ? 'review_approved' :
            reviewStatus === 'rejected' ? 'review_rejected' :
            (defaultValues?.status === 'draft' ? 'draft' :
             defaultValues?.status === 'archived' ? 'archived' : 'published')
          } />
          {reviewStatus === 'rejected' && reviewNotes && (
            <span className="text-xs text-red-600 truncate max-w-[200px]">Rejected: {reviewNotes}</span>
          )}
          {isDirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => router.back()}
            className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface transition">Cancel</button>

          {/* Pending review — read-only */}
          {reviewStatus === 'pending' && (
            <>
              <button type="button" disabled
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted opacity-50">Save Draft</button>
              <button type="button" disabled
                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white opacity-50">Waiting for Review</button>
            </>
          )}

          {/* Approved — can publish */}
          {reviewStatus === 'approved' && (
            <>
              <button type="submit" disabled={saving}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button type="button" onClick={handlePublish} disabled={saving}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50">
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </>
          )}

          {/* Draft (no review) or rejected — can edit and submit */}
          {(!reviewStatus || reviewStatus === 'rejected') && productId && (
            <>
              <button type="submit" disabled={saving}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button type="button" onClick={handleSubmitForReview} disabled={saving}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit for Review'}
              </button>
            </>
          )}

          {/* New product (no productId) — just save */}
          {(!reviewStatus || reviewStatus === 'rejected') && !productId && (
            <button type="submit" disabled={saving}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          )}

          {/* Published — existing behavior */}
          {!reviewStatus && defaultValues?.status === 'published' && (
            <button type="submit" disabled={saving}
              className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50">
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
