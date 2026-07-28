export const dynamic = 'force-dynamic';

import { getHomepageSections, upsertSection, deleteSection, reorderSections } from './actions';
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
      id: id || undefined,
      type: data.get('type') as string,
      enabled: data.get('enabled') === 'true',
      sortOrder: parseInt(data.get('sortOrder') as string) || 0,
      title: data.get('title') as string,
      subtitle: data.get('subtitle') as string,
      settings: JSON.parse((data.get('settings') as string) || '{}'),
    });
    revalidatePath('/admin/homepage');
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteSection(id);
    revalidatePath('/admin/homepage');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Homepage Builder</h1>
          <p className="text-sm text-muted mt-1">Add, edit, reorder, and toggle homepage sections.</p>
        </div>
      </div>

      {/* Existing sections */}
      <div className="space-y-3">
        {sections.map((s: any, i: number) => (
          <SectionEditor
            key={s.id}
            section={s}
            index={i}
            onSave={handleUpsert}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {sections.length === 0 && (
        <p className="text-sm text-muted py-8 text-center">No sections yet. Add one below.</p>
      )}

      {/* Add section */}
      <div className="mt-6 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-primary mb-3">Add Section</h2>
        <div className="grid gap-2 sm:grid-cols-5">
          {SECTION_TYPES.map(({ type, label, icon }) => (
            <form key={type} action={handleUpsert}>
              <input type="hidden" name="type" value={type} />
              <input type="hidden" name="title" value={label} />
              <input type="hidden" name="sortOrder" value={sections.length} />
              <input type="hidden" name="settings" value="{}" />
              <input type="hidden" name="enabled" value="true" />
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
