'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function getHomepageSections() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function upsertSection(data: { id?: string; type: string; enabled?: boolean; sortOrder?: number; title?: string; subtitle?: string; settings?: any }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  if (data.id) {
    const { id, ...rest } = data;
    await prisma.homepageSection.update({ where: { id }, data: rest });
  } else {
    await prisma.homepageSection.create({ data: { type: data.type, sortOrder: data.sortOrder ?? 0, title: data.title ?? '', subtitle: data.subtitle ?? '', settings: data.settings ?? {} } });
  }
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

export async function reorderSections(ids: string[]) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  for (let i = 0; i < ids.length; i++) {
    await prisma.homepageSection.update({ where: { id: ids[i] }, data: { sortOrder: i } });
  }
  revalidatePath('/admin/homepage');
  revalidatePath('/');
}
