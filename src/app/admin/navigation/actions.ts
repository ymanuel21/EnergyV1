'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function getNavigationLinks() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.navigationLink.findMany({ orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }] });
}

export async function upsertNavLink(data: { id?: string; group: string; label: string; href: string; sortOrder?: number; enabled?: boolean }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  if (data.id) {
    const { id, ...rest } = data;
    await prisma.navigationLink.update({ where: { id }, data: rest });
  } else {
    await prisma.navigationLink.create({ data: { group: data.group, label: data.label, href: data.href, sortOrder: data.sortOrder ?? 0 } });
  }
  revalidatePath('/admin/navigation');
  revalidatePath('/');
}

export async function deleteNavLink(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  await prisma.navigationLink.delete({ where: { id } });
  revalidatePath('/admin/navigation');
  revalidatePath('/');
}
