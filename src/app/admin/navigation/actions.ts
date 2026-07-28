'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import { safeWrite } from '@/lib/transaction';
import { navigationLinkSchema } from '@/lib/validations';

export async function getNavigationLinks() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.navigationLink.findMany({ orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }] });
}

export async function upsertNavLink(data: { id?: string; group: string; label: string; href: string; sortOrder?: number; enabled?: boolean }) {
  await requireAuth();
  const isUpdate = !!(data.id && data.id !== 'undefined');
  await safeWrite({
    entityType: 'navigationLink',
    entityId: isUpdate ? data.id : undefined,
    entityName: data.label,
    action: isUpdate ? 'update' : 'create',
    data: { ...data, enabled: data.enabled ?? true, sortOrder: data.sortOrder ?? 0 },
    schema: navigationLinkSchema,
    execute: async (tx: any) => {
      if (isUpdate) {
        const { id: _, ...rest } = data;
        return tx.navigationLink.update({ where: { id: data.id }, data: { ...rest, enabled: data.enabled ?? true, sortOrder: data.sortOrder ?? 0 } });
      }
      return tx.navigationLink.create({ data: { group: data.group, label: data.label, href: data.href, sortOrder: data.sortOrder ?? 0 } });
    },
  });
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
