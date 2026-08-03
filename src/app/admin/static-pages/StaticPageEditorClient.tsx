'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/app/admin/AdminToastProvider';
import { RichEditor } from '@/components/editor/RichEditor';
import { EditorPreview } from '@/components/editor/EditorPreview';
import { markdownToHtml } from '@/lib/markdown-migration';
import { SlugInput } from '../SlugInput';

interface StaticPageEditorClientProps {
  pageId: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  updateAction: (id: string, data: { title?: string; slug?: string; content?: string; description?: string }) => Promise<void>;
}

export function StaticPageEditorClient({ pageId, title: initialTitle, slug: initialSlug, content: rawContent, description: initialDesc, updateAction }: StaticPageEditorClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [t, setT] = useState(initialTitle);
  const [s, setS] = useState(initialSlug);
  const [html, setHtml] = useState(() => markdownToHtml(rawContent));
  const [desc, setDesc] = useState(initialDesc);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    function beforeUnload(e: BeforeUnloadEvent) {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const markDirty = useCallback(() => { if (!dirty) setDirty(true); }, [dirty]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateAction(pageId, { title: t, slug: s, content: html, description: desc });
      setDirty(false); setSaved(true); showToast('✓ Berhasil disimpan', 'success');
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch {
      showToast('✕ Gagal menyimpan', 'error');
    } finally { setSaving(false); }
  }, [pageId, t, s, html, desc, updateAction, router, showToast]);

  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      {/* Title + Slug */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-primary mb-1">Title</label>
          <input value={t} onChange={e => { setT(e.target.value); markDirty(); }}
            className="w-full rounded-lg border border-border px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-primary mb-1">Slug</label>
          <SlugInput name="slug" defaultValue={s} className="w-full rounded-lg border border-border px-3 py-1.5 text-sm" />
        </div>
      </div>

      {/* Rich Editor */}
      <RichEditor content={html} onChange={h => { setHtml(h); markDirty(); }} />

      {/* Toggle Preview */}
      <button type="button" onClick={() => setShowPreview(!showPreview)}
        className="text-xs text-muted underline hover:text-primary">
        {showPreview ? 'Hide Preview' : 'Show Preview'}
      </button>
      {showPreview && <EditorPreview html={html} title={t} />}

      {/* SEO Description */}
      <div>
        <label className="block text-xs font-medium text-primary mb-1">SEO Description</label>
        <input value={desc} onChange={e => { setDesc(e.target.value); markDirty(); }}
          placeholder="Brief meta description for search engines"
          className="w-full rounded-lg border border-border px-3 py-1.5 text-sm" />
      </div>

      {/* Save Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs">
          {dirty && <span className="text-amber-600">Unsaved changes</span>}
          {!dirty && saved && <span className="text-green-600">✓ Saved</span>}
        </span>
        <button type="button" onClick={handleSave} disabled={!dirty || saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition">
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
