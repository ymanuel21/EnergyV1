export const dynamic = 'force-dynamic';

import { getStaticPages, updateStaticPage } from './actions';
import Link from 'next/link';
import { SlugInput } from '../SlugInput';
import { StaticPageEditorClient } from './StaticPageEditorClient';

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

            <StaticPageEditorClient
              pageId={p.id}
              title={p.title}
              slug={p.slug}
              content={p.content}
              description={p.description || ''}
              updateAction={updateStaticPage}
            />
          </details>
        ))}
      </div>
    </div>
  );
}
