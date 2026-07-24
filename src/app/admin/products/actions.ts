'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getProducts() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.product.findMany({ include: { brand: true, category: true }, orderBy: { createdAt: 'desc' } });
}

export async function getProduct(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.product.findUnique({ where: { id }, include: { brand: true, category: true } });
}

export async function createProduct(data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.product.delete({ where: { id } });
}

export async function getBrandsForSelect() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.brand.findMany({ orderBy: { name: 'asc' } });
}

export async function getCategoriesForSelect() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}
