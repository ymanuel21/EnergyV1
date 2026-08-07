'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getBrands() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.brand.findMany({ orderBy: { name: 'asc' } });
}

export async function getBrandUsage(brandId: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const productCount = await prisma.product.count({ where: { brandId } });
  return { productCount };
}

export async function getBrand(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.brand.findUnique({ where: { id } });
}

export async function createBrand(data: {
  name: string;
  slug: string;
  logo?: string | null;
}) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.brand.create({
    data: { id: `b-${Date.now()}`, ...data },
  });
}

export async function updateBrand(
  id: string,
  data: { name?: string; slug?: string; logo?: string | null }
) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  // Remove empty string logo (user deleted it)
  const clean = { ...data };
  if (clean.logo === '') clean.logo = null;
  return prisma.brand.update({ where: { id }, data: clean });
}

export async function deleteBrand(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const usage = await prisma.product.count({ where: { brandId: id } });
  if (usage > 0) {
    throw new Error(`Brand is currently used by ${usage} product${usage > 1 ? 's' : ''}.`);
  }
  return prisma.brand.delete({ where: { id } });
}
