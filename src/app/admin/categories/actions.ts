'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getCategories() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}
export async function createCategory(data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.create({ data: { id: `cat-${Date.now()}`, ...data } });
}
export async function updateCategory(id: string, data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.update({ where: { id }, data });
}
export async function deleteCategory(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.delete({ where: { id } });
}
