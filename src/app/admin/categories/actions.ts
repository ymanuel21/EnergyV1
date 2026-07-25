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

export async function createCategory(data: { name: string; slug: string; parentId?: string | null }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.create({
    data: {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      parentId: data.parentId || null,
    },
  });
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; parentId?: string | null }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      parentId: data.parentId === '' ? null : data.parentId === undefined ? undefined : data.parentId,
    },
  });
}

export async function deleteCategory(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  await prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } });
  return prisma.category.delete({ where: { id } });
}
