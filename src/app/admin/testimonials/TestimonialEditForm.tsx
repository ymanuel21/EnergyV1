'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';
import { saveDraft, publishEntity } from '@/lib/services/content-versioning';
import { submitForReview } from '@/lib/services/review';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ImageUpload } from '../ImageUpload';
import Link from 'next/link';

interface TestimonialEditFormProps {
  testimonial: {
    id: string;
    name: string;
    company: string;
    role: string;
    quote: string;
    rating: number;
    photo: string;
    productIds: string[];
    featured: boolean;
    sortOrder: number;
    status: string;
    updatedAt: string;
  };
  reviewStatus?: string | null;
  reviewNotes?: string | null;
}

export function TestimonialEditForm({ testimonial, reviewStatus, reviewNotes }: TestimonialEditFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(testimonial.rating);
  const [projectSearch, setProjectSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [linkedProjects, setLinkedProjects] = useState<string[]>(testimonial.productIds || []);

  const markDirty = () => { if (!dirty) setDirty(true); };

  const buildFormData = useCallback((form: HTMLFormElement) => ({
    name: (form.elements.namedItem('name') as HTMLInputElement)?.value || '',
    company: (form.elements.namedItem('company') as HTMLInputElement)?.value || '',
    role: (form.elements.namedItem('role') as HTMLInputElement)?.value || '',
    quote: (form.elements.namedItem('quote') as HTMLTextAreaElement)?.value || '',
    rating,
    photo: (form.elements.namedItem('photo') as HTMLInputElement)?.value || '',
    productIds: linkedProjects,
    featured: (form.elements.namedItem('featured') as HTMLInputElement)?.checked || false,
    sortOrder: parseInt((form.elements.namedItem('sortOrder') as HTMLInputElement)?.value || '0') || 0,
  }), [rating, linkedProjects]);

  const handleSaveDraft = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = buildFormData(e.currentTarget as HTMLFormElement);
      await saveDraft({ entity: 'testimonial', id: testimonial.id, data });
      setDirty(false);
      showToast('✓ Draft berhasil disimpan', 'success');
      router.refresh();
    } catch {
      showToast('✕ Gagal menyimpan', 'error');
      setSaving(false);
    }
  }, [testimonial.id, buildFormData, router]);

  const handlePublish = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = buildFormData(e.currentTarget as HTMLFormElement);
      await saveDraft({ entity: 'testimonial', id: testimonial.id, data });
      await publishEntity({ entity: 'testimonial', id: testimonial.id });
      setDirty(false);
      showToast('✓ Testimoni berhasil dipublikasikan', 'success');
      router.push('/admin/testimonials');
    } catch {
      showToast('✕ Gagal mempublikasikan', 'error');
      setSaving(false);
    }
  }, [testimonial.id, buildFormData, router]);

  const handleSubmitForReview = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = buildFormData(e.currentTarget as HTMLFormElement);
      await saveDraft({ entity: 'testimonial', id: testimonial.id, data });
      await submitForReview('testimonial', testimonial.id);
      setDirty(false);
      showToast('✓ Testimoni berhasil dikirim untuk review', 'success');
      router.refresh();
    } catch {
      showToast('✕ Gagal mengirim review', 'error');
      setSaving(false);
    }
  }, [testimonial.id, buildFormData, router]);

  const handleSearchProjects = useCallback(async () => {
    if (!projectSearch.trim()) return;
    try {
      const res = await fetch(`/api/admin/search-products?q=${encodeURIComponent(projectSearch)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch { setSearchResults([]); }
  }, [projectSearch]);

  const addProject = useCallback((id: string) => {
    if (!linkedProjects.includes(id)) {
      setLinkedProjects(prev => [...prev, id]);
      markDirty();
    }
    setProjectSearch('');
    setSearchResults([]);
  }, [linkedProjects]);

  const inputCls = 'w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card';
  const labelCls = 'block text-sm font-medium text-primary mb-1';

  return (
    <form onSubmit={handleSaveDraft}>
      <div className="p-6 space-y-6">
        {/* Content */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Customer Name <span className="text-red-500">*</span></label>
            <input name="name" defaultValue={testimonial.name} required className={inputCls} onChange={markDirty} />
          </div>
          <div>
            <label className={labelCls}>Company</label>
            <input name="company" defaultValue={testimonial.company} className={inputCls} onChange={markDirty} />
          </div>
          <div>
            <label className={labelCls}>Role / Title</label>
            <input name="role" defaultValue={testimonial.role} className={inputCls} placeholder="e.g. Operations Director" onChange={markDirty} />
          </div>
          <div>
            <label className={labelCls}>Rating</label>
            <div className="flex gap-1 text-xl">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => { setRating(n); markDirty(); }}
                  className={n <= rating ? 'text-amber-400' : 'text-muted'}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Testimonial <span className="text-red-500">*</span></label>
            <textarea name="quote" rows={4} defaultValue={testimonial.quote} required
              className={inputCls + ' resize-y'} onChange={markDirty}
              placeholder="What did the customer say?" />
          </div>
        </div>

        {/* Photo */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-primary mb-3">Photo</h3>
          <ImageUpload name="photo" defaultValue={testimonial.photo} />
          <Link href="/admin/media" target="_blank"
            className="inline-block mt-2 text-xs text-muted underline hover:text-primary">
            📁 Pilih dari Media Library
          </Link>
        </div>

        {/* Linked Projects */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-semibold text-primary mb-3">Linked Projects</h3>
          <div className="flex gap-2 mb-3">
            <input value={projectSearch} onChange={e => setProjectSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearchProjects(); } }}
              className={inputCls} placeholder="Search projects..." />
            <button type="button" onClick={handleSearchProjects}
              className="rounded-lg bg-primary px-3 py-2 text-sm text-white hover:bg-primary-hover">Search</button>
          </div>
          {searchResults.length > 0 && (
            <div className="rounded-lg border border-border max-h-40 overflow-auto mb-3">
              {searchResults.map((p: any) => (
                <button key={p.id} type="button" onClick={() => addProject(p.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-surface border-b last:border-0">
                  {p.name}
                </button>
              ))}
            </div>
          )}
          {linkedProjects.map(pid => (
            <div key={pid} className="flex items-center justify-between rounded border border-border px-3 py-1.5 mb-1">
              <span className="text-xs text-muted font-mono">{pid}</span>
              <button type="button" onClick={() => { setLinkedProjects(prev => prev.filter(id => id !== pid)); markDirty(); }}
                className="text-xs text-red-500 hover:underline">Remove</button>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="border-t border-border pt-6 space-y-3">
          <h3 className="text-sm font-semibold text-primary">Settings</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="featured" defaultChecked={testimonial.featured} onChange={markDirty} className="rounded" />
            <span className="text-sm text-primary">Featured (appears on homepage)</span>
          </label>
          <div>
            <label className={labelCls}>Display Order</label>
            <input name="sortOrder" type="number" defaultValue={testimonial.sortOrder} className={inputCls + ' w-24'} onChange={markDirty} />
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 border-t border-border bg-card rounded-b-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge status={
            reviewStatus === 'pending' ? 'review_pending' :
            reviewStatus === 'approved' ? 'review_approved' :
            reviewStatus === 'rejected' ? 'review_rejected' :
            (testimonial.status === 'draft' ? 'draft' :
             testimonial.status === 'archived' ? 'archived' : 'published')
          } />
          {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/testimonials" className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface">Cancel</Link>

          {reviewStatus === 'pending' && (
            <>
              <button type="button" disabled className="rounded-lg border px-4 py-2 text-sm text-muted opacity-50">Save Draft</button>
              <button type="button" disabled className="rounded-lg bg-blue-500 px-6 py-2 text-sm text-white opacity-50">Waiting for Review</button>
            </>
          )}

          {reviewStatus === 'approved' && (
            <>
              <button type="submit" disabled={saving} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button type="button" onClick={handlePublish} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-50">
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </>
          )}

          {(!reviewStatus || reviewStatus === 'rejected') && (
            <>
              <button type="submit" disabled={saving} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button type="button" onClick={handleSubmitForReview} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-50">
                {saving ? 'Submitting...' : 'Submit for Review'}
              </button>
            </>
          )}

          {!reviewStatus && testimonial.status === 'published' && (
            <button type="button" onClick={handlePublish} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-50">
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
