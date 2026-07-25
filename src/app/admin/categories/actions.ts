'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getCategories() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.findMany({
    include: { parent: true, children: true },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function createCategory(data: Record<string, any>) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const { parentId, ...rest } = data;
  return prisma.category.create({
    data: {
      id: `cat-${Date.now()}`,
      ...rest,
      parentId: parentId || null,
    },
  });
}

export async function updateCategory(id: string, data: Record<string, any>) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const { parentId, ...rest } = data;
  return prisma.category.update({
    where: { id },
    data: { ...rest, parentId: parentId === '' ? null : parentId || undefined },
  });
}

export async function deleteCategory(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  // Remove children's parent reference before deleting
  await prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } });
  return prisma.category.delete({ where: { id } });
}
