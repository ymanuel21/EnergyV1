export const dynamic = 'force-dynamic';

import { getHomepageSections, upsertSection, deleteSection, moveSection } from './actions';
import { revalidatePath } from 'next/cache';
import { HomepageBuilder } from './HomepageBuilder';
import { sectionRegistry } from '@/lib/section-registry';

export default async function HomepageBuilderPage() {
  const sections = await getHomepageSections();

  // Build draft-vs-published diff for each section
  const sectionDiff = new Map<string, { draft?: any; published?: any }>();
  for (const s of sections) {
    const versions = [...(s.versions || [])];
    sectionDiff.set(s.id, {
      draft: versions.find((v: any) => v.status === 'draft'),
      published: versions.find((v: any) => v.status === 'published'),
    });
  }

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

  async function handleMove(id: string, direction: 'up' | 'down') {
    'use server';
    await moveSection(id, direction);
    revalidatePath('/admin/homepage');
    revalidatePath('/');
  }

  return (
    <HomepageBuilder
      initialSections={sections}
      sectionDiff={sectionDiff}
      onSave={handleUpsert}
      onDelete={handleDelete}
      onMoveUp={(id: string) => handleMove(id, 'up')}
      onMoveDown={(id: string) => handleMove(id, 'down')}
      onAdd={async (type: string) => {
        'use server';
        await upsertSection({ type, enabled: true, status: 'draft', sortOrder: sections.length, title: sectionRegistry[type]?.label || '', subtitle: '', settings: sectionRegistry[type]?.defaultSettings || {} });
        revalidatePath('/admin/homepage');
      }}
    />
  );
}
