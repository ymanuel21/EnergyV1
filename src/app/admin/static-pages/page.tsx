export const dynamic = 'force-dynamic';

import { getStaticPages, updateStaticPage } from './actions';
import Link from 'next/link';
import { SlugInput } from '../SlugInput';

export default async function StaticPagesPage() {
  const pages = await getStaticPages();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Static Pages</h1>
      <p className="text-sm text-muted mb-6">{pages.length} pages — editable legal & informational content</p>

      <div className="space-y-4">
        {pages.map((p) => (
          <details key={p.id} className="rounded-lg border border-border bg-card p-4 group">
            <summary className="cursor-pointer flex items-center gap-3">
              <span className="text-sm font-medium text-primary flex-1">{p.title}</span>
              <span className="text-xs text-muted font-mono">/halaman/{p.slug}</span>
              <span className="text-xs text-muted">Updated {new Date(p.updatedAt).toLocaleDateString('id-ID')}</span>
              <Link href={`/halaman/${p.slug}`} target="_blank"
                className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:bg-surface">Preview →</Link>
            </summary>

            <form action={async (formData: FormData) => {
              'use server';
              await updateStaticPage(p.id, {
                title: formData.get('title') as string || undefined,
                slug: formData.get('slug') as string || undefined,
                content: formData.get('content') as string || undefined,
                description: formData.get('description') as string || undefined,
              });
            }} className="mt-4 space-y-3 border-t border-border pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-primary mb-1">Title</label>
                  <input name="title" defaultValue={p.title}
                    className="w-full rounded-lg border border-border px-3 py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-primary mb-1">Slug</label>
                  <SlugInput name="slug" defaultValue={p.slug} className="w-full rounded-lg border border-border px-3 py-1.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-primary mb-1">Content (Markdown)</label>
                <textarea name="content" rows={16} defaultValue={p.content}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm font-mono resize-y" />
              </div>
              <div>
                <label className="block text-xs font-medium text-primary mb-1">SEO Description</label>
                <input name="description" defaultValue={p.description || ''} placeholder="Brief meta description for search engines"
                  className="w-full rounded-lg border border-border px-3 py-1.5 text-sm" />
              </div>
              <div className="flex justify-end">
                <button type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
                  Save Changes
                </button>
              </div>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
