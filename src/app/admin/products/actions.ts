'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getProducts() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.product.findMany({
    include: { brand: true, categories: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProduct(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.product.findUnique({
    where: { id },
    include: { brand: true, categories: { include: { category: true } } },
  });
}

export async function createProduct(data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const { categoryIds, categoryId, ...productData } = data;

  // Keep legacy categoryId for backward compat
  productData.categoryId = categoryId || (categoryIds?.[0] || null);

  const product = await prisma.product.create({ data: productData });

  // Create ProductCategory relations
  if (categoryIds?.length) {
    await prisma.productCategory.createMany({
      data: categoryIds.map((catId: string) => ({ productId: product.id, categoryId: catId })),
    });
  }

  return product;
}

export async function updateProduct(id: string, data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const { categoryIds, categoryId, ...productData } = data;

  // Keep legacy categoryId
  if (categoryId !== undefined) productData.categoryId = categoryId;

  const product = await prisma.product.update({ where: { id }, data: productData });

  // Replace category relations
  await prisma.productCategory.deleteMany({ where: { productId: id } });
  if (categoryIds?.length) {
    await prisma.productCategory.createMany({
      data: categoryIds.map((catId: string) => ({ productId: id, categoryId: catId })),
    });
  }

  return product;
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
  return prisma.category.findMany({
    include: { children: true },
    orderBy: { sortOrder: 'asc' },
  });
}
