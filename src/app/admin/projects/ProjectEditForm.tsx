'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';
import { saveDraft, publishEntity } from '@/lib/services/content-versioning';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ProjectMediaPanel } from './ProjectMediaPanel';
import Link from 'next/link';

const TABS = ['Overview', 'Story', 'Media', 'Impact', 'Products', 'SEO', 'Settings'] as const;
type Tab = typeof TABS[number];

const CATEGORIES = ['residential', 'commercial', 'industrial', 'government', 'school'];
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
    productIds: string[];
    storyData: { challenge?: string; solution?: string; result?: string };
    impactData: { co2Reduction?: string; annualSavings?: string; energyGenerated?: string };
    seoData: { title?: string; description?: string; ogImage?: string };
    featured: boolean;
    status: string;
    updatedAt: string;
  };
}

export function ProjectEditForm({ project }: ProjectEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');

  // Story state
  const [story, setStory] = useState({
    challenge: project.storyData?.challenge || '',
    solution: project.storyData?.solution || '',
    result: project.storyData?.result || '',
  });

  // Impact state
  const [impact, setImpact] = useState({
    co2Reduction: project.impactData?.co2Reduction || '',
    annualSavings: project.impactData?.annualSavings || '',
    energyGenerated: project.impactData?.energyGenerated || '',
  });

  // SEO state
  const [seo, setSeo] = useState({
    title: project.seoData?.title || '',
    description: project.seoData?.description || '',
    ogImage: project.seoData?.ogImage || '',
  });

  // Product linking with quantities
  const [linkedProducts, setLinkedProducts] = useState<{ slug: string; name: string; brand: string; category: string; image: string; quantity: number }[]>(() => {
    // Migrate from old productIds[] format
    const ids = project.productIds || [];
    if (ids.length > 0 && typeof ids[0] === 'string') {
      return (ids as string[]).map(slug => ({ slug, name: '', brand: '', category: '', image: '', quantity: 1 }));
    }
    return (ids as any[]).map((p: any) => ({
      slug: p.slug || p.productId || '',
      name: p.name || '',
      brand: p.brand || '',
      category: p.category || '',
      image: p.image || '',
      quantity: p.quantity || 1,
    }));
  });
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTimer = useState<any>(null)[0];
  const [changingIndex, setChangingIndex] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Highlights
  const [highlights, setHighlights] = useState<string[]>(() => {
    const raw = project.highlights;
    if (Array.isArray(raw)) return raw.filter(h => typeof h === 'string' && h.trim());
    return [];
  });

  const markDirty = useCallback(() => {
    if (!dirty) setDirty(true);
    if (saveState !== 'idle') setSaveState('idle');
  }, [dirty, saveState]);

  const addHighlight = useCallback(() => {
    if (highlights.length >= 20) return;
    setHighlights(prev => [...prev, '']);
    markDirty();
  }, [highlights.length, markDirty]);

  const updateHighlight = useCallback((i: number, value: string) => {
    setHighlights(prev => prev.map((h, j) => j === i ? value : h));
    markDirty();
  }, [markDirty]);

  const removeHighlight = useCallback((i: number) => {
    setHighlights(prev => prev.filter((_, j) => j !== i));
    markDirty();
  }, [markDirty]);

  const moveHighlight = useCallback((i: number, dir: number) => {
    const target = i + dir;
    if (target < 0 || target >= highlights.length) return;
    setHighlights(prev => {
      const next = [...prev];
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
    markDirty();
  }, [highlights.length, markDirty]);

  // Build publish data from React state (not FormData — fields may be hidden in other tabs)
  const buildPublishData = useCallback(() => ({
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    richDescription: project.richDescription,
    category: project.category,
    industry: project.industry,
    systemType: project.systemType,
    capacity: project.capacity,
    pvModule: project.pvModule,
    inverter: project.inverter,
    battery: project.battery,
    location: project.location,
    customer: project.customer,
    year: project.year,
    coverImage: project.coverImage,
    images: project.images,
    featured: project.featured,
    storyData: story,
    impactData: impact,
    seoData: seo,
    productIds: linkedProducts.map(p => ({ slug: p.slug, quantity: p.quantity })),
    highlights: highlights.filter(h => h.trim()),
  }), [project, story, impact, seo, linkedProducts, highlights]);

  const handleSaveDraft = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = buildPublishData();
      await saveDraft({ entity: 'project', id: project.id, data });
      setDirty(false);
      setSaveState('saved');
      showToast('✓ Draft berhasil disimpan', 'success');
      router.refresh();
    } catch {
      showToast('✕ Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  }, [project.id, buildPublishData, router, showToast]);

  const handlePublish = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const data = buildPublishData();
      await saveDraft({ entity: 'project', id: project.id, data });
      await publishEntity({ entity: 'project', id: project.id });
      setDirty(false);
      setSaveState('saved');
      showToast('✓ Proyek berhasil dipublikasikan', 'success');
      router.refresh();
      router.push('/admin/projects');
    } catch (err: any) {
      showToast('✕ Gagal: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  }, [project.id, buildPublishData, saving, router, showToast]);

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
    if (linkedProducts.some(p => p.slug === slug)) return; // duplicate prevention
    setLinkedProducts(prev => [...prev, {
      slug,
      name: prod.name || '',
      brand: prod.brand?.name || prod.brand || '',
      category: prod.category || '',
      image: prod.images?.[0] || prod.image || '',
      quantity: 1,
    }]);
    markDirty();
    setProductSearch('');
    setSearchResults([]);
    setSearchOpen(false);
    setChangingIndex(null);
  }, [linkedProducts, markDirty]);

  const removeProduct = useCallback((index: number) => {
    setLinkedProducts(prev => prev.filter((_, i) => i !== index));
    markDirty();
  }, [markDirty]);

  const updateQuantity = useCallback((index: number, qty: number) => {
    if (qty < 1) qty = 1;
    if (qty > 99999) qty = 99999;
    setLinkedProducts(prev => prev.map((p, i) => i === index ? { ...p, quantity: qty } : p));
    markDirty();
  }, [markDirty]);

  const changeProduct = useCallback((index: number, newProd: any) => {
    setLinkedProducts(prev => prev.map((p, i) => i === index ? {
      ...p,
      slug: newProd.slug,
      name: newProd.name || '',
      brand: newProd.brand?.name || newProd.brand || '',
      category: newProd.category || '',
      image: newProd.images?.[0] || newProd.image || '',
    } : p));
    markDirty();
    setProductSearch('');
    setSearchResults([]);
    setSearchOpen(false);
    setChangingIndex(null);
  }, [markDirty]);

  const inputCls = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';
  const labelCls = 'block text-sm font-medium text-primary mb-1';

  const status = project.status as 'draft' | 'published' | 'archived';

  return (
    <form ref={formRef} onSubmit={handleSaveDraft}>
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
              <input name="title" defaultValue={project.title} required className={inputCls} onChange={markDirty} />
            </div>
            <div>
              <label className={labelCls}>Slug <span className="text-red-500">*</span></label>
              <input name="slug" defaultValue={project.slug} required className={inputCls} onChange={markDirty} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" defaultValue={project.category} className={inputCls} onChange={markDirty}>
                {CATEGORIES.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Industry</label>
              <input name="industry" defaultValue={project.industry} className={inputCls} onChange={markDirty} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Short Description</label>
            <textarea name="shortDescription" rows={2} defaultValue={project.shortDescription} className={inputCls + ' resize-y'} onChange={markDirty} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>System Type</label>
              <select name="systemType" defaultValue={project.systemType || ''} className={inputCls} onChange={markDirty}>
                {SYSTEM_TYPES.map(t => <option key={t} value={t}>{t || '—'}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Capacity</label>
              <input name="capacity" defaultValue={project.capacity} className={inputCls} placeholder="e.g. 10 kWp" onChange={markDirty} />
            </div>
            <div>
              <label className={labelCls}>Completion Year</label>
              <input name="year" type="number" defaultValue={project.year} className={inputCls} onChange={markDirty} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Customer Name</label>
              <input name="customer" defaultValue={project.customer} className={inputCls} onChange={markDirty} />
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input name="location" defaultValue={project.location} className={inputCls} placeholder="e.g. Jakarta Selatan" onChange={markDirty} />
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
            <textarea rows={3} value={story.challenge}
              onChange={e => { setStory(s => ({ ...s, challenge: e.target.value })); markDirty(); }}
              className={inputCls + ' resize-y'} placeholder="What problem did the customer face?" />
          </div>
          <div>
            <label className={labelCls}>Solution</label>
            <textarea rows={3} value={story.solution}
              onChange={e => { setStory(s => ({ ...s, solution: e.target.value })); markDirty(); }}
              className={inputCls + ' resize-y'} placeholder="How did you solve it?" />
          </div>
          <div>
            <label className={labelCls}>Result</label>
            <textarea rows={3} value={story.result}
              onChange={e => { setStory(s => ({ ...s, result: e.target.value })); markDirty(); }}
              className={inputCls + ' resize-y'} placeholder="What were the outcomes?" />
          </div>
          <div>
            <label className={labelCls}>Full Story (Rich Text)</label>
            <textarea name="richDescription" rows={6} defaultValue={project.richDescription}
              className={inputCls + ' resize-y'} onChange={markDirty}
              placeholder="Detailed narrative with formatting..." />
          </div>
        </div>
      )}

      {/* ═══ Media Tab ═══ */}
      {activeTab === 'Media' && (
        <div className="p-6 space-y-4">
          <ProjectMediaPanel
            defaultCoverImage={project.coverImage}
            defaultImages={project.images || []}
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
              <input value={impact.co2Reduction}
                onChange={e => { setImpact(i => ({ ...i, co2Reduction: e.target.value })); markDirty(); }}
                className={inputCls} placeholder="e.g. 12.5 tons/year" />
            </div>
            <div>
              <label className={labelCls}>Annual Savings</label>
              <input value={impact.annualSavings}
                onChange={e => { setImpact(i => ({ ...i, annualSavings: e.target.value })); markDirty(); }}
                className={inputCls} placeholder="e.g. Rp 45.000.000" />
            </div>
            <div>
              <label className={labelCls}>Energy Generated</label>
              <input value={impact.energyGenerated}
                onChange={e => { setImpact(i => ({ ...i, energyGenerated: e.target.value })); markDirty(); }}
                className={inputCls} placeholder="e.g. 15.000 kWh/year" />
            </div>
            <div>
              <label className={labelCls}>Installation Capacity</label>
              <input name="capacity" defaultValue={project.capacity} className={inputCls} placeholder="e.g. 10 kWp" onChange={markDirty} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelCls}>PV Module</label>
              <input name="pvModule" defaultValue={project.pvModule} className={inputCls} placeholder="e.g. Longi 550W" onChange={markDirty} />
            </div>
            <div>
              <label className={labelCls}>Inverter</label>
              <input name="inverter" defaultValue={project.inverter} className={inputCls} onChange={markDirty} />
            </div>
            <div>
              <label className={labelCls}>Battery</label>
              <input name="battery" defaultValue={project.battery} className={inputCls} onChange={markDirty} />
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
            <label className={labelCls}>Linked Products ({linkedProducts.length})</label>
            {linkedProducts.length === 0 && (
              <p className="text-sm text-muted">No products linked yet. Search above to add.</p>
            )}
            {linkedProducts.map((lp, i) => (
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
            <input value={seo.title}
              onChange={e => { setSeo(s => ({ ...s, title: e.target.value })); markDirty(); }}
              className={inputCls} placeholder={project.title ? `${project.title} | EBTPlaza` : 'Project Title | EBTPlaza'} />
          </div>
          <div>
            <label className={labelCls}>Meta Description</label>
            <textarea rows={3} value={seo.description}
              onChange={e => { setSeo(s => ({ ...s, description: e.target.value })); markDirty(); }}
              className={inputCls + ' resize-y'} placeholder="Brief summary for search results (120-160 characters)" />
          </div>
          <div>
            <label className={labelCls}>OG Image URL</label>
            <input value={seo.ogImage}
              onChange={e => { setSeo(s => ({ ...s, ogImage: e.target.value })); markDirty(); }}
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
              <input type="checkbox" name="featured" value="true" defaultChecked={project.featured} onChange={markDirty} className="rounded border-border" />
              <span className="text-sm text-primary">Featured Project</span>
            </label>
            <p className="text-xs text-muted mt-1 ml-6">Featured projects appear on the homepage and top of the portfolio list.</p>
          </div>
          <div className="pt-4 border-t border-border">
            <label className={labelCls}>Project Highlights</label>
            <p className="text-xs text-muted mb-2">Key achievements shown on the public page.</p>

            {highlights.length === 0 && (
              <p className="text-sm text-muted py-2">No highlights yet.</p>
            )}

            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className="text-primary shrink-0 text-xs">✓</span>
                <input value={h} onChange={e => updateHighlight(i, e.target.value)}
                  placeholder="Highlight text..."
                  className="flex-1 rounded border border-border px-2 py-1 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card" />
                <div className="flex gap-0.5">
                  <button type="button" onClick={() => moveHighlight(i, -1)} disabled={i === 0}
                    className="rounded px-1 py-0.5 text-[10px] text-muted hover:bg-surface transition disabled:opacity-20">↑</button>
                  <button type="button" onClick={() => moveHighlight(i, 1)} disabled={i === highlights.length - 1}
                    className="rounded px-1 py-0.5 text-[10px] text-muted hover:bg-surface transition disabled:opacity-20">↓</button>
                </div>
                <button type="button" onClick={() => removeHighlight(i)}
                  className="text-[10px] text-red-500 hover:underline shrink-0">Hapus</button>
              </div>
            ))}

            {highlights.length < 20 && (
              <button type="button" onClick={addHighlight}
                className="mt-2 text-xs text-primary hover:underline">
                + Add Highlight
              </button>
            )}
            {highlights.length >= 20 && (
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
          {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
          {saveState === 'saved' && <span className="text-xs text-green-600">Saved</span>}
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
        </div>
      </div>
    </form>
  );
}