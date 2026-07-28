'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import { safeWrite } from '@/lib/transaction';
import { homepageSectionSchema } from '@/lib/validations';

export async function getHomepageSections() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function upsertSection(data: {
  id?: string; type: string; enabled?: boolean; status?: string;
  sortOrder?: number; title?: string; subtitle?: string; settings?: any;
}) {
  await requireAuth();
  const isUpdate = !!(data.id && data.id !== 'undefined');
  await safeWrite({
    entityType: 'homepageSection',
    entityId: isUpdate ? data.id : undefined,
    entityName: data.title || data.type,
    action: isUpdate ? 'update' : 'create',
    data: { ...data, settings: data.settings ?? {} },
    schema: homepageSectionSchema,
    execute: async (tx: any) => {
      const payload = {
        type: data.type, enabled: data.enabled ?? true,
        status: data.status ?? 'published', sortOrder: data.sortOrder ?? 0,
        title: data.title ?? '', subtitle: data.subtitle ?? '', settings: data.settings ?? {},
      };
      if (isUpdate) return tx.homepageSection.update({ where: { id: data.id }, data: payload });
      return tx.homepageSection.create({ data: payload });
    },
  });
  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

export async function deleteSection(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  await prisma.homepageSection.delete({ where: { id } });
  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

export async function moveSection(id: string, direction: 'up' | 'down') {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
  const idx = sections.findIndex(s => s.id === id);
  if (idx < 0) return;
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (targetIdx < 0 || targetIdx >= sections.length) return;
  const current = sections[idx];
  const target = sections[targetIdx];
  await prisma.$transaction([
    prisma.homepageSection.update({ where: { id: current.id }, data: { sortOrder: target.sortOrder } }),
    prisma.homepageSection.update({ where: { id: target.id }, data: { sortOrder: current.sortOrder } }),
  ]);
  revalidatePath('/admin/homepage');
  revalidatePath('/');
}
