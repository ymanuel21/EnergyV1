export const dynamic = 'force-dynamic';

import { getHomepageSections, upsertSection, deleteSection, moveSection } from './actions';
import { revalidatePath } from 'next/cache';
import { SectionEditor } from './SectionEditor';

const SECTION_TYPES = [
  { type: 'hero', label: 'Hero', icon: '🏠' },
  { type: 'category-grid', label: 'Category Grid', icon: '📂' },
  { type: 'featured-products', label: 'Featured Products', icon: '⭐' },
  { type: 'brands', label: 'Brands', icon: '🏢' },
  { type: 'cta', label: 'CTA', icon: '📣' },
];

export default async function HomepageBuilderPage() {
  const sections = await getHomepageSections();

  async function handleUpsert(data: FormData) {
    'use server';
    const id = data.get('id') as string;
    await upsertSection({
      id: (id && id !== 'undefined') ? id : undefined,
      type: data.get('type') as string,
      enabled: data.get('enabled') === 'true',
      status: (data.get('status') as string) || 'published',
      sortOrder: parseInt(data.get('sortOrder') as string) || sections.length,
      title: data.get('title') as string,
      subtitle: data.get('subtitle') as string,
      settings: JSON.parse((data.get('settings') as string) || '{}'),
    });
    revalidatePath('/admin/homepage');
    revalidatePath('/');
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteSection(id);
    revalidatePath('/admin/homepage');
    revalidatePath('/');
  }

  async function handleMoveUp(id: string) {
    'use server';
    await moveSection(id, 'up');
    revalidatePath('/admin/homepage');
  }

  async function handleMoveDown(id: string) {
    'use server';
    await moveSection(id, 'down');
    revalidatePath('/admin/homepage');
  }

  const published = sections.filter((s: any) => s.status === 'published' && s.enabled).length;
  const drafts = sections.filter((s: any) => s.status === 'draft').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Homepage Builder</h1>
          <p className="text-sm text-muted mt-1">
            {sections.length} sections · {published} published · {drafts > 0 ? `${drafts} draft` : 'no drafts'}
          </p>
        </div>
        <a href="/?preview=true" target="_blank" className="rounded border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">
          Preview →
        </a>
      </div>

      <div className="space-y-2">
        {sections.map((s: any, i: number) => (
          <SectionEditor
            key={s.id}
            section={s}
            index={i}
            total={sections.length}
            onSave={handleUpsert}
            onDelete={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))}
      </div>

      {sections.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted text-sm">No sections yet. Add your first section below.</p>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-primary mb-3">Add Section</h2>
        <div className="grid gap-2 sm:grid-cols-5">
          {SECTION_TYPES.map(({ type, label, icon }) => (
            <form key={type} action={handleUpsert}>
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="title" value={label} />
              <input type="hidden" name="sortOrder" value={sections.length} />
              <input type="hidden" name="settings" value="{}" />
              <input type="hidden" name="status" value="draft" />
              <input type="hidden" name="enabled" value="false" />
              <button type="submit" className="w-full rounded-lg border border-border bg-card p-4 text-center hover:border-primary hover:shadow-sm transition">
                <span className="text-2xl block mb-1">{icon}</span>
                <span className="text-xs font-medium text-primary">{label}</span>
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
