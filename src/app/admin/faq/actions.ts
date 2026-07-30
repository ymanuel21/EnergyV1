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

export async function moveFaq(id: number, direction: 'up' | 'down') {
  'use server';
  await requireAuth();
  const prisma = await getAdminPrisma();
  
  const current = await prisma.faq.findUnique({ where: { id } });
  if (!current) return;

  const all = await prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
  const idx = all.findIndex(f => f.id === id);
  if (idx === -1) return;
  if (direction === 'up' && idx === 0) return;
  if (direction === 'down' && idx === all.length - 1) return;

  const sibling = all[direction === 'up' ? idx - 1 : idx + 1];
  const tmp = current.sortOrder;
  
  await prisma.$transaction([
    prisma.faq.update({ where: { id: current.id }, data: { sortOrder: sibling.sortOrder } }),
    prisma.faq.update({ where: { id: sibling.id }, data: { sortOrder: tmp } }),
  ]);
}
