export const dynamic = 'force-dynamic';

import { getHomepageSections, upsertSection, deleteSection, moveSection } from './actions';
import { revalidatePath } from 'next/cache';
import { HomepageBuilder } from './HomepageBuilder';
import { sectionRegistry } from '@/lib/section-registry';

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
    console.log('[upsertSection] heroProductId:', JSON.parse((data.get('settings') as string) || '{}').heroProductId);
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

  async function handleAdd(type: string) {
    'use server';
    const def = sectionRegistry[type];
    const defaultSettings = def?.defaultSettings || {};
    await upsertSection({
      type,
      enabled: false,
      status: 'draft',
      sortOrder: sections.length,
      title: def?.label || type,
      subtitle: '',
      settings: defaultSettings as Record<string, unknown>,
    });
    revalidatePath('/admin/homepage');
  }

  return (
    <HomepageBuilder
      initialSections={sections}
      onSave={handleUpsert}
      onDelete={handleDelete}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onAdd={handleAdd}
    />
  );
}
