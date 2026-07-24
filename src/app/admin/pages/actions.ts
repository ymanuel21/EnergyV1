'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getPages() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.staticPage.findMany();
}
export async function getPageBySlug(slug: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.staticPage.findUnique({ where: { slug } });
}
export async function createPage(data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.staticPage.create({ data });
}
export async function updatePage(slug: string, data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.staticPage.update({ where: { slug }, data });
}
