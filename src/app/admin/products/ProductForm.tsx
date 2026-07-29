'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  const [specs, setSpecs] = useState<any[]>((defaultValues?.specifications) || []);
  const [gallery, setGallery] = useState<string[]>(() => {
    const raw = defaultValues?.images;
    if (!raw || (Array.isArray(raw) && raw.length === 0)) return [];
    return Array.isArray(raw) ? raw : [];
  });
  const [downloads, setDownloads] = useState<any[]>((defaultValues?.downloads) || []);
  const [relations, setRelations] = useState<any[]>((defaultValues?.relations) || []);

  const defaultCatIds: string[] = defaultValues?.categories?.map((pc: any) => pc.categoryId)
    || (defaultValues?.categoryId ? [defaultValues.categoryId] : []);
  const topCategories = categories.filter((c: any) => !c.parentId);

  const markDirty = () => { if (!dirty) setDirty(true); };

  const productId = defaultValues?.id;

  const buildFormPayload = useCallback((form: HTMLFormElement) => {
    const fd = new FormData(form);
    const categoryIds = categories.filter((c: any) => fd.get(`cat-${c.id}`) === 'on').map((c: any) => c.id);
    return {
      name: fd.get('name'), slug: fd.get('slug'),
      price: parseInt(fd.get('price') as string) || 0,
      originalPrice: fd.get('originalPrice') ? parseInt(fd.get('originalPrice') as string) || null : null,
      stock: parseInt(fd.get('stock') as string) || 0,
      sku: fd.get('sku') || null, description: fd.get('description'),
      images: gallery.length ? gallery : ['/images/placeholder/product-placeholder.png'],
      specifications: specs.filter((s: any) => s.key?.trim()),
      downloads, relations: relations.map((r: any) => ({ relatedProductId: r.relatedProductId, type: r.type })),
      badges: [], badgeIds: [], brandId: fd.get('brandId'),
      categoryIds, categoryId: categoryIds[0] || null,
      condition: fd.get('condition') || 'new',
      warranty: fd.get('warranty') || '1 Tahun',
      weight: parseFloat(fd.get('weight') as string) || 0,
      affiliateCommission: { percent: 2.5, amount: Math.round((parseInt(fd.get('price') as string) || 0) * 0.025) },
      isActive: true,
    };
  }, [categories, gallery, specs, downloads, relations]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = buildFormPayload(e.currentTarget as HTMLFormElement);

    if (productId) {
      await saveDraft({ entity: 'product', id: productId, data });
      setSaving(false); setDirty(false); setSaveState('saved');
      router.refresh();
    } else {
      await onSubmit(data);
      setSaving(false); setDirty(false);
      router.push('/admin/products'); router.refresh();
    }
  }, [productId, buildFormPayload, onSubmit, router]);

  const handlePublish = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setSaving(true);
    const data = buildFormPayload(e.currentTarget as HTMLFormElement);
    await saveDraft({ entity: 'product', id: productId, data });
    await publishEntity({ entity: 'product', id: productId });
    setSaving(false); setDirty(false);
    router.push('/admin/products'); router.refresh();
  }, [productId, buildFormPayload, router]);

  const handleSubmitForReview = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    setSaving(true);
    const data = buildFormPayload(e.currentTarget as HTMLFormElement);
    await saveDraft({ entity: 'product', id: productId, data });
    await submitForReview('product', productId);
    setSaving(false); setDirty(false);
    router.refresh();
  }, [productId, buildFormPayload, router]);

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

      {/* ── Tab Content (DEBUG — stripped to isolate crash) ── */}
      <div className="p-4">
        <p className="text-sm font-medium">✅ Tab: {activeTab} | Product: {defaultValues?.name}</p>
        <p className="text-xs text-muted mt-1">specs: {(defaultValues?.specifications as any)?.length} | imgs: {(defaultValues?.images as any)?.length} | badges: {defaultValues?.badgeRelations?.length}</p>
      </div>

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
          {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
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
