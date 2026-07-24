'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getBanners() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
}
export async function createBanner(data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.banner.create({ data });
}
export async function updateBanner(id: string, data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.banner.update({ where: { id }, data });
}
export async function deleteBanner(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.banner.delete({ where: { id } });
}
