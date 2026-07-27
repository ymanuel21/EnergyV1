'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getBadges() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.badge.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createBadge(data: { slug: string; name: string; color?: string; bgColor?: string; icon?: string; sortOrder?: number }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.badge.create({ data });
}

export async function updateBadge(id: string, data: { name?: string; slug?: string; color?: string; bgColor?: string; icon?: string; sortOrder?: number; isActive?: boolean }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.badge.update({ where: { id }, data });
}

export async function deleteBadge(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.badge.delete({ where: { id } });
}
