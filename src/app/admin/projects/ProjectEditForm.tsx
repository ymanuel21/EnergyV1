'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';
import { saveDraft, publishEntity } from '@/lib/services/content-versioning';
import { submitForReview } from '@/lib/services/review';
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
  reviewStatus?: string | null;
  reviewNotes?: string | null;
}

export function ProjectEditForm({ project, reviewStatus, reviewNotes }: ProjectEditFormProps) {
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

  // Product linking
  const [linkedProductIds, setLinkedProductIds] = useState<string[]>(project.productIds || []);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const markDirty = useCallback(() => {
    if (!dirty) setDirty(true);
    if (saveState !== 'idle') setSaveState('idle');
  }, [dirty, saveState]);

  const buildFormData = useCallback((form: HTMLFormElement) => {
    const fd = new FormData(form);
    let images: string[] = [];
    try { images = JSON.parse((fd.get('images') as string) || '[]'); } catch { /* keep [] */ }

    return {
      title: fd.get('title') as string,
      slug: fd.get('slug') as string,
      shortDescription: fd.get('shortDescription') as string,
      richDescription: fd.get('richDescription') as string,
      category: fd.get('category') as string,
      industry: fd.get('industry') as string,
      systemType: fd.get('systemType') as string,
      capacity: fd.get('capacity') as string,
      pvModule: fd.get('pvModule') as string,
      inverter: fd.get('inverter') as string,
      battery: fd.get('battery') as string,
      location: fd.get('location') as string,
      customer: fd.get('customer') as string,
      year: parseInt(fd.get('year') as string) || 2025,
      coverImage: fd.get('coverImage') as string,
      images,
      featured: fd.get('featured') === 'true',
      storyData: story,
      impactData: impact,
      seoData: seo,
      productIds: linkedProductIds,
    };
  }, [story, impact, seo, linkedProductIds]);

  const handleSaveDraft = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = buildFormData(e.currentTarget as HTMLFormElement);
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
  }, [project.id, buildFormData, router, showToast]);

  const handlePublish = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const data = buildFormData(e.currentTarget as HTMLFormElement);
      await saveDraft({ entity: 'project', id: project.id, data });
      await publishEntity({ entity: 'project', id: project.id });
      setDirty(false);
      setSaveState('saved');
      showToast('✓ Proyek berhasil dipublikasikan', 'success');
      router.refresh();
      router.push('/admin/projects');
    } catch {
      showToast('✕ Gagal mempublikasikan', 'error');
    } finally {
      setSaving(false);
    }
  }, [project.id, buildFormData, saving, router, showToast]);

  const handleSubmitForReview = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const data = buildFormData(e.currentTarget as HTMLFormElement);
      await saveDraft({ entity: 'project', id: project.id, data });
      await submitForReview('project', project.id);
      setDirty(false);
      setSaveState('saved');
      showToast('✓ Proyek berhasil dikirim untuk review', 'success');
      router.refresh();
    } catch {
      showToast('✕ Gagal mengirim review', 'error');
    } finally {
      setSaving(false);
    }
  }, [project.id, buildFormData, saving, router, showToast]);

  const handleSearchProducts = useCallback(async () => {
    if (!productSearch.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/search-products?q=${encodeURIComponent(productSearch)}`);
      const data = await res.json();
      setSearchResults(data.products || data || []);
    } catch { setSearchResults([]); }
    setSearching(false);
  }, [productSearch]);

  const addProduct = useCallback((productId: string) => {
    if (!linkedProductIds.includes(productId)) {
      setLinkedProductIds(prev => [...prev, productId]);
      markDirty();
    }
    setProductSearch('');
    setSearchResults([]);
  }, [linkedProductIds, markDirty]);

  const removeProduct = useCallback((productId: string) => {
    setLinkedProductIds(prev => prev.filter(id => id !== productId));
    markDirty();
  }, [markDirty]);

  const inputCls = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';
  const labelCls = 'block text-sm font-medium text-primary mb-1';

  const status = project.status as 'draft' | 'published' | 'archived';

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
          <p className="text-xs text-muted">Link products used in this project. They will appear on the public project page.</p>

          {/* Search */}
          <div className="flex gap-2">
            <input value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchProducts(); } }}
              className={inputCls} placeholder="Search products by name..." />
            <button type="button" onClick={handleSearchProducts} disabled={searching}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50">
              {searching ? '...' : 'Search'}
            </button>
          </div>

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="rounded-lg border border-border max-h-48 overflow-auto">
              {searchResults.map((p: any) => (
                <button key={p.id} type="button"
                  onClick={() => addProduct(p.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface border-b border-border/50 last:border-0 flex justify-between items-center">
                  <span className="text-primary">{p.name}</span>
                  <span className="text-xs text-muted">{p.brand?.name || ''}</span>
                </button>
              ))}
            </div>
          )}

          {/* Linked products */}
          <div className="space-y-2">
            <label className={labelCls}>Linked Products ({linkedProductIds.length})</label>
            {linkedProductIds.length === 0 && (
              <p className="text-sm text-muted">No products linked yet.</p>
            )}
            {linkedProductIds.map((pid, i) => (
              <div key={pid} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-primary font-mono text-xs">{pid}</span>
                <button type="button" onClick={() => removeProduct(pid)}
                  className="text-xs text-red-500 hover:underline">Remove</button>
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
            {((project.highlights as string[]) || []).map((h: string, i: number) => (
              <div key={i} className="flex items-center gap-2 py-1">
                <span className="text-primary shrink-0">✓</span>
                <span className="text-sm text-muted">{h}</span>
              </div>
            ))}
            {(!project.highlights || (project.highlights as string[]).length === 0) && (
              <p className="text-sm text-muted">No highlights. Edit highlights via the database or seed script.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Sticky Save Bar ── */}
      <div className="sticky bottom-0 border-t border-border bg-card rounded-b-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={
            reviewStatus === 'pending' ? 'review_pending' :
            reviewStatus === 'approved' ? 'review_approved' :
            reviewStatus === 'rejected' ? 'review_rejected' :
            status
          } />
          <span className="text-xs text-muted hidden sm:inline">
            Last updated: {new Date(project.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          {reviewStatus === 'rejected' && reviewNotes && (
            <span className="text-xs text-red-600 truncate max-w-[150px]">Rejected: {reviewNotes}</span>
          )}
          {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
          {saveState === 'saved' && <span className="text-xs text-green-600">Saved</span>}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/projects" className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface transition">
            Cancel
          </Link>

          {reviewStatus === 'pending' && (
            <>
              <button type="button" disabled className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted opacity-50">Save Draft</button>
              <button type="button" disabled className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white opacity-50">Waiting for Review</button>
            </>
          )}

          {reviewStatus === 'approved' && (
            <>
              <button type="submit" disabled={saving} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button type="button" onClick={handlePublish} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50">
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </>
          )}

          {(!reviewStatus || reviewStatus === 'rejected') && (
            <>
              <button type="submit" disabled={saving} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-surface transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button type="button" onClick={handleSubmitForReview} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit for Review'}
              </button>
            </>
          )}

          {!reviewStatus && status === 'published' && (
            <button type="button" onClick={handlePublish} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-50">
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
