'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getFaqs() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
}
export async function createFaq(data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.faq.create({ data });
}
export async function updateFaq(id: number, data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.faq.update({ where: { id }, data });
}
export async function deleteFaq(id: number) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.faq.delete({ where: { id } });
}
