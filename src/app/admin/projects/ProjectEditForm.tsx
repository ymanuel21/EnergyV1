'use client';

import { useState, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';
import { saveDraft, publishEntity } from '@/lib/services/content-versioning';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ProjectMediaPanel } from './ProjectMediaPanel';
import { projectReducer, makeInitialProjectState, buildProjectPayload } from './projectReducer';
import type { ProjectAction } from './projectReducer';
import Link from 'next/link';

const TABS = ['Overview', 'Story', 'Media', 'Impact', 'Products', 'SEO', 'Settings'] as const;
type Tab = typeof TABS[number];

const CATEGORIES = ['residential', 'commercial', 'industrial', 'government', 'school', 'social'];
const SYSTEM_TYPES = ['', 'On-Grid', 'Off-Grid', 'Hybrid'];

interface ProjectEditFormProps {
  project: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    richDescription: string;
    category: string;
    industry: string;
    systemType: string;
    capacity: string;
    pvModule: string;
    inverter: string;
    battery: string;
    location: string;
    customer: string;
    year: number;
    coverImage: string;
    images: string[];
    highlights: string[];
    productIds: any;
    storyData: any;
    impactData: any;
    seoData: any;
    featured: boolean;
    status: string;
    updatedAt: string;
  };
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [saving, setSaving] = useState(false);

  const [state, dispatch] = useReducer(projectReducer, project, makeInitialProjectState);

  // Product search state (local — not part of project data until selected)
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [changingIndex, setChangingIndex] = useState<number | null>(null);

  const projectId = project.id;
  const status = project.status as 'draft' | 'published' | 'archived';

  const handleSaveDraft = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = buildProjectPayload(state);
      await saveDraft({ entity: 'project', id: projectId, data });
      dispatch({ type: 'MARK_CLEAN' });
      showToast('✓ Draft berhasil disimpan', 'success');
      router.refresh();
    } catch {
      showToast('✕ Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  }, [projectId, state, router, showToast]);

  const handlePublish = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const data = buildProjectPayload(state);
      await saveDraft({ entity: 'project', id: projectId, data });
      await publishEntity({ entity: 'project', id: projectId });
      dispatch({ type: 'MARK_CLEAN' });
      showToast('✓ Proyek berhasil dipublikasikan', 'success');
      router.refresh();
      router.push('/admin/projects');
    } catch (err: any) {
      showToast('✕ Gagal: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  }, [projectId, state, saving, router, showToast]);

  // Product search
  const handleSearchProducts = useCallback(async (query: string) => {
    if (!query || query.length < 2) { setSearchResults([]); setSearchOpen(false); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/search-products?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const results = (data.products || data || []).slice(0, 8);
      setSearchResults(results);
      setSearchOpen(results.length > 0);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, []);

  const addProduct = useCallback((prod: any) => {
    const slug = prod.slug;
    if (state.linkedProducts.some(p => p.slug === slug)) return;
    dispatch({
      type: 'SET_LINKED_PRODUCTS',
      value: [...state.linkedProducts, {
        slug,
        name: prod.name || '',
        brand: prod.brand?.name || prod.brand || '',
        category: prod.category || '',
        image: prod.images?.[0] || prod.image || '',
        quantity: 1,
      }],
    });
    setProductSearch('');
    setSearchResults([]);
    setSearchOpen(false);
    setChangingIndex(null);
  }, [state.linkedProducts]);

  const removeProduct = useCallback((index: number) => {
    dispatch({
      type: 'SET_LINKED_PRODUCTS',
      value: state.linkedProducts.filter((_, i) => i !== index),
    });
  }, [state.linkedProducts]);

  const updateQuantity = useCallback((index: number, qty: number) => {
    if (qty < 1) qty = 1;
    if (qty > 99999) qty = 99999;
    dispatch({
      type: 'SET_LINKED_PRODUCTS',
      value: state.linkedProducts.map((p, i) => i === index ? { ...p, quantity: qty } : p),
    });
  }, [state.linkedProducts]);

  const changeProduct = useCallback((index: number, newProd: any) => {
    dispatch({
      type: 'SET_LINKED_PRODUCTS',
      value: state.linkedProducts.map((p, i) => i === index ? {
        ...p,
        slug: newProd.slug,
        name: newProd.name || '',
        brand: newProd.brand?.name || newProd.brand || '',
        category: newProd.category || '',
        image: newProd.images?.[0] || newProd.image || '',
      } : p),
    });
    setProductSearch('');
    setSearchResults([]);
    setSearchOpen(false);
    setChangingIndex(null);
  }, [state.linkedProducts]);

  // Highlights
  const addHighlight = useCallback(() => {
    if (state.highlights.length >= 20) return;
    dispatch({ type: 'SET_HIGHLIGHTS', value: [...state.highlights, ''] });
  }, [state.highlights]);

  const updateHighlight = useCallback((i: number, value: string) => {
    dispatch({
      type: 'SET_HIGHLIGHTS',
      value: state.highlights.map((h, j) => j === i ? value : h),
    });
  }, [state.highlights]);

  const removeHighlight = useCallback((i: number) => {
    dispatch({
      type: 'SET_HIGHLIGHTS',
      value: state.highlights.filter((_, j) => j !== i),
    });
  }, [state.highlights]);

  const moveHighlight = useCallback((i: number, dir: number) => {
    const target = i + dir;
    if (target < 0 || target >= state.highlights.length) return;
    const next = [...state.highlights];
    [next[i], next[target]] = [next[target], next[i]];
    dispatch({ type: 'SET_HIGHLIGHTS', value: next });
  }, [state.highlights]);

  const inputCls = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';
  const labelCls = 'block text-sm font-medium text-primary mb-1';

  return (
    <form onSubmit={handleSaveDraft}>
      {/* ── Tab Bar ── */}
      <div className="flex gap-0 border-b border-border px-6 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* ═══ Overview Tab ═══ */}
      {activeTab === 'Overview' && (
        <div className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Project Name <span className="text-red-500">*</span></label>
              <input name="title" value={state.title} required className={inputCls}
                onChange={e => dispatch({ type: 'SET_TITLE', value: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Slug <span className="text-red-500">*</span></label>
              <input name="slug" value={state.slug} required className={inputCls}
                onChange={e => dispatch({ type: 'SET_SLUG', value: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" value={state.category} className={inputCls}
                onChange={e => dispatch({ type: 'SET_CATEGORY', value: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Industry</label>
              <input name="industry" value={state.industry} className={inputCls}
                onChange={e => dispatch({ type: 'SET_INDUSTRY', value: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Short Description</label>
            <textarea name="shortDescription" rows={2} value={state.shortDescription} className={inputCls + ' resize-y'}
              onChange={e => dispatch({ type: 'SET_SHORT_DESCRIPTION', value: e.target.value })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>System Type</label>
              <select name="systemType" value={state.systemType || ''} className={inputCls}
                onChange={e => dispatch({ type: 'SET_SYSTEM_TYPE', value: e.target.value })}>
                {SYSTEM_TYPES.map(t => <option key={t} value={t}>{t || '—'}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Capacity</label>
              <input name="capacity" value={state.capacity} className={inputCls} placeholder="e.g. 10 kWp"
                onChange={e => dispatch({ type: 'SET_CAPACITY', value: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Completion Year</label>
              <input name="year" type="number" value={state.year} className={inputCls}
                onChange={e => dispatch({ type: 'SET_YEAR', value: parseInt(e.target.value) || 2025 })} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Customer Name</label>
              <input name="customer" value={state.customer} className={inputCls}
                onChange={e => dispatch({ type: 'SET_CUSTOMER', value: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input name="location" value={state.location} className={inputCls} placeholder="e.g. Jakarta Selatan"
                onChange={e => dispatch({ type: 'SET_LOCATION', value: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ Story Tab ═══ */}
      {activeTab === 'Story' && (
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted">Structure the project as a case study.</p>
          <div>
            <label className={labelCls}>Challenge</label>
            <textarea rows={3} value={state.storyChallenge}
              onChange={e => dispatch({ type: 'SET_STORY_CHALLENGE', value: e.target.value })}
              className={inputCls + ' resize-y'} placeholder="What problem did the customer face?" />
          </div>
          <div>
            <label className={labelCls}>Solution</label>
            <textarea rows={3} value={state.storySolution}
              onChange={e => dispatch({ type: 'SET_STORY_SOLUTION', value: e.target.value })}
              className={inputCls + ' resize-y'} placeholder="How did you solve it?" />
          </div>
          <div>
            <label className={labelCls}>Result</label>
            <textarea rows={3} value={state.storyResult}
              onChange={e => dispatch({ type: 'SET_STORY_RESULT', value: e.target.value })}
              className={inputCls + ' resize-y'} placeholder="What were the outcomes?" />
          </div>
          <div>
            <label className={labelCls}>Full Story (Rich Text)</label>
            <textarea name="richDescription" rows={6} value={state.richDescription}
              className={inputCls + ' resize-y'}
              onChange={e => dispatch({ type: 'SET_RICH_DESCRIPTION', value: e.target.value })}
              placeholder="Detailed narrative with formatting..." />
          </div>
        </div>
      )}

      {/* ═══ Media Tab ═══ */}
      {activeTab === 'Media' && (
        <div className="p-6 space-y-4">
          <ProjectMediaPanel
            coverImage={state.coverImage}
            onCoverImageChange={v => dispatch({ type: 'SET_COVER_IMAGE', value: v })}
            images={state.images}
            onImagesChange={v => dispatch({ type: 'SET_IMAGES', value: v })}
          />
        </div>
      )}

      {/* ═══ Impact Tab ═══ */}
      {activeTab === 'Impact' && (
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted">Quantify the environmental and financial impact.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>CO₂ Reduction</label>
              <input value={state.impactCo2Reduction}
                onChange={e => dispatch({ type: 'SET_IMPACT_CO2', value: e.target.value })}
                className={inputCls} placeholder="e.g. 12.5 tons/year" />
            </div>
            <div>
              <label className={labelCls}>Annual Savings</label>
              <input value={state.impactAnnualSavings}
                onChange={e => dispatch({ type: 'SET_IMPACT_SAVINGS', value: e.target.value })}
                className={inputCls} placeholder="e.g. Rp 45.000.000" />
            </div>
            <div>
              <label className={labelCls}>Energy Generated</label>
              <input value={state.impactEnergyGenerated}
                onChange={e => dispatch({ type: 'SET_IMPACT_ENERGY', value: e.target.value })}
                className={inputCls} placeholder="e.g. 15.000 kWh/year" />
            </div>
            <div>
              <label className={labelCls}>Installation Capacity</label>
              <input value={state.capacity}
                onChange={e => dispatch({ type: 'SET_CAPACITY', value: e.target.value })}
                className={inputCls} placeholder="e.g. 10 kWp" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>PV Module</label>
              <input value={state.pvModule}
                onChange={e => dispatch({ type: 'SET_PV_MODULE', value: e.target.value })}
                className={inputCls} placeholder="e.g. Longi 550W" />
            </div>
            <div>
              <label className={labelCls}>Inverter</label>
              <input value={state.inverter}
                onChange={e => dispatch({ type: 'SET_INVERTER', value: e.target.value })}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Battery</label>
              <input value={state.battery}
                onChange={e => dispatch({ type: 'SET_BATTERY', value: e.target.value })}
                className={inputCls} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ Products Tab ═══ */}
      {activeTab === 'Products' && (
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted">Link products used in this project. They appear on the public project page and RFQ.</p>

          {/* Search with autocomplete */}
          <div className="relative">
            <div className="flex gap-2">
              <input value={productSearch}
                onChange={e => { setProductSearch(e.target.value); handleSearchProducts(e.target.value); }}
                onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchResults([]); } }}
                onFocus={() => { if (productSearch.length >= 2 && searchResults.length > 0) setSearchOpen(true); }}
                className={inputCls} placeholder="Search products by name..." />
              <button type="button" onClick={() => handleSearchProducts(productSearch)} disabled={searching}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
                {searching ? '...' : 'Search'}
              </button>
            </div>

            {/* Autocomplete dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-xl max-h-80 overflow-auto">
                {searching && <div className="px-3 py-4 text-xs text-muted text-center">Searching...</div>}
                {searchResults.map((p: any) => (
                  <button key={p.id} type="button"
                    onClick={() => changingIndex !== null ? changeProduct(changingIndex, p) : addProduct(p)}
                    className="w-full text-left px-3 py-3 hover:bg-surface border-b border-border/50 last:border-0 flex items-center gap-3 transition-colors">
                    <img src={p.images?.[0] || '/images/placeholder/product-placeholder.png'} alt="" className="h-10 w-10 rounded object-cover shrink-0 bg-surface" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-primary font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted">{p.brand?.name || p.brand || ''}{p.category ? ` • ${p.category}` : ''}</p>
                    </div>
                    <span className="text-xs text-muted shrink-0">{p.price ? `Rp ${Number(p.price).toLocaleString('id-ID')}` : 'Hubungi Kami'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Linked products */}
          <div className="space-y-2">
            <label className={labelCls}>Linked Products ({state.linkedProducts.length})</label>
            {state.linkedProducts.length === 0 && (
              <p className="text-sm text-muted">No products linked yet. Search above to add.</p>
            )}
            {state.linkedProducts.map((lp, i) => (
              <div key={lp.slug + i} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card">
                <img
                  src={lp.image || '/images/placeholder/product-placeholder.png'}
                  alt={lp.name} className="h-12 w-12 rounded-lg object-cover shrink-0 bg-surface"
                  onError={e => { (e.target as HTMLImageElement).src = '/images/placeholder/product-placeholder.png'; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-primary truncate">{lp.name || lp.slug}</h4>
                  <p className="text-xs text-muted">{lp.category || ''}{lp.brand ? ` • ${lp.brand}` : ''}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => updateQuantity(i, lp.quantity - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border text-sm text-muted hover:bg-surface transition">−</button>
                  <input
                    type="number" min={1} max={99999}
                    value={lp.quantity}
                    onChange={e => { const v = parseInt(e.target.value); updateQuantity(i, isNaN(v) ? 1 : v); }}
                    className="h-7 w-14 rounded border border-border text-center text-sm bg-card [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button type="button" onClick={() => updateQuantity(i, lp.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-border text-sm text-muted hover:bg-surface transition">+</button>
                </div>
                <button type="button" onClick={() => { setChangingIndex(i); setProductSearch(''); setSearchOpen(false); }}
                  className="text-xs text-primary hover:underline shrink-0">Change</button>
                <button type="button" onClick={() => removeProduct(i)}
                  className="text-xs text-red-500 hover:underline shrink-0">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ SEO Tab ═══ */}
      {activeTab === 'SEO' && (
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted">Control how this project appears in search results and social shares.</p>
          <div>
            <label className={labelCls}>SEO Title</label>
            <input value={state.seoTitle}
              onChange={e => dispatch({ type: 'SET_SEO_TITLE', value: e.target.value })}
              className={inputCls} placeholder={state.title ? `${state.title} | EBTPlaza` : 'Project Title | EBTPlaza'} />
          </div>
          <div>
            <label className={labelCls}>Meta Description</label>
            <textarea rows={3} value={state.seoDescription}
              onChange={e => dispatch({ type: 'SET_SEO_DESCRIPTION', value: e.target.value })}
              className={inputCls + ' resize-y'} placeholder="Brief summary for search results (120-160 characters)" />
          </div>
          <div>
            <label className={labelCls}>OG Image URL</label>
            <input value={state.seoOgImage}
              onChange={e => dispatch({ type: 'SET_SEO_OG_IMAGE', value: e.target.value })}
              className={inputCls} placeholder="https://..." />
          </div>
          <div className="p-4 rounded-lg bg-surface text-xs text-muted">
            <p className="font-medium text-primary mb-1">SEO Tip</p>
            <p>SEO Title appears in browser tabs & Google results. Meta description is the snippet under the title. OG Image is used when sharing on social media.</p>
          </div>
        </div>
      )}

      {/* ═══ Settings Tab ═══ */}
      {activeTab === 'Settings' && (
        <div className="p-6 space-y-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={state.featured}
                onChange={e => dispatch({ type: 'SET_FEATURED', value: e.target.checked })}
                className="rounded border-border" />
              <span className="text-sm text-primary">Featured Project</span>
            </label>
            <p className="text-xs text-muted mt-1 ml-6">Featured projects appear on the homepage and top of the portfolio list.</p>
          </div>
          <div className="pt-4 border-t border-border">
            <label className={labelCls}>Project Highlights</label>
            <p className="text-xs text-muted mb-2">Key achievements shown on the public page.</p>

            {state.highlights.length === 0 && (
              <p className="text-sm text-muted py-2">No highlights yet.</p>
            )}

            {state.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className="text-primary shrink-0 text-xs">✓</span>
                <input value={h} onChange={e => updateHighlight(i, e.target.value)}
                  placeholder="Highlight text..."
                  className="flex-1 rounded border border-border px-2 py-1 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card" />
                <div className="flex gap-0.5">
                  <button type="button" onClick={() => moveHighlight(i, -1)} disabled={i === 0}
                    className="rounded px-1 py-0.5 text-[10px] text-muted hover:bg-surface transition disabled:opacity-20">↑</button>
                  <button type="button" onClick={() => moveHighlight(i, 1)} disabled={i === state.highlights.length - 1}
                    className="rounded px-1 py-0.5 text-[10px] text-muted hover:bg-surface transition disabled:opacity-20">↓</button>
                </div>
                <button type="button" onClick={() => removeHighlight(i)}
                  className="text-[10px] text-red-500 hover:underline shrink-0">Hapus</button>
              </div>
            ))}

            {state.highlights.length < 20 && (
              <button type="button" onClick={addHighlight}
                className="mt-2 text-xs text-primary hover:underline">
                + Add Highlight
              </button>
            )}
            {state.highlights.length >= 20 && (
              <p className="text-xs text-muted mt-1">Maximum 20 highlights.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Sticky Save Bar ── */}
      <div className="sticky bottom-0 border-t border-border bg-card rounded-b-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <span className="text-xs text-muted hidden sm:inline">
            Last updated: {new Date(project.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {state.dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/projects" className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface transition">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button type="button" onClick={handlePublish} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50">
            {saving ? 'Publishing...' : 'Publish'}
          </button>
          <button type="button"
            onClick={() => window.open(`/proyek/${state.slug}`, '_blank')}
            disabled={!state.slug || status !== 'published'}
            title={!state.slug || status !== 'published' ? 'Publish the project first.' : 'View on public site'}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed">
            View Project ↗
          </button>
        </div>
      </div>
    </form>
  );
}
