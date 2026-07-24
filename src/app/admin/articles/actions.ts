'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getArticles() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
}
export async function getArticle(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.article.findUnique({ where: { id } });
}
export async function createArticle(data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.article.create({ data });
}
export async function updateArticle(id: string, data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.article.update({ where: { id }, data });
}
export async function deleteArticle(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.article.delete({ where: { id } });
}
