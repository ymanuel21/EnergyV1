'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export async function getProducts(filters?: { brandId?: string; categoryId?: string }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const where: any = {};
  if (filters?.brandId) where.brandId = filters.brandId;
  if (filters?.categoryId) where.categories = { some: { categoryId: filters.categoryId } };
  return prisma.product.findMany({
    where,
    include: { brand: true, categories: { include: { category: true } }, badgeRelations: { include: { badge: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getProduct(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      categories: { include: { category: true } },
      badgeRelations: { include: { badge: true } },
      relations: { include: { relatedProduct: { select: { id: true, name: true, price: true, brand: { select: { name: true } } } } } },
    },
  });
  if (!product) return null;
  // Merge draftData overlay if status=draft
  const draftData = (product.status === 'draft' && product.draftData) ? (product.draftData as Record<string, unknown>) : {};
  // Flatten relations for the editor
  return {
    ...product,
    ...draftData,
    relations: product.relations.map((r: any) => ({
      id: r.id,
      productId: r.productId,
      relatedProductId: r.relatedProductId,
      type: r.type,
      relatedProduct: r.relatedProduct,
    })),
  };
}

export async function createProduct(data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const { categoryIds, categoryId, badgeIds, relations, seoTitle, metaDescription, ...productData } = data;

  productData.categoryId = categoryId || (categoryIds?.[0] || null);
  productData.status = 'draft';         // new products start as draft
  productData.draftData = {};           // empty draftData
  productData.isActive = false;         // hidden until published

  const product = await prisma.product.create({ data: productData });

  if (categoryIds?.length) {
    await prisma.productCategory.createMany({
      data: categoryIds.map((catId: string) => ({ productId: product.id, categoryId: catId })),
    });
  }
  if (badgeIds?.length) {
    await prisma.productBadge.createMany({
      data: badgeIds.map((badgeId: string) => ({ productId: product.id, badgeId })),
    });
  }
  if (relations?.length) {
    await prisma.productRelation.createMany({
      data: relations.map((r: any) => ({ productId: product.id, relatedProductId: r.relatedProductId, type: r.type })),
    });
  }

  return product;
}

export async function updateProduct(id: string, data: any) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const { categoryIds, categoryId, badgeIds, relations, seoTitle, metaDescription, ...productData } = data;

  if (categoryId !== undefined) productData.categoryId = categoryId;

  const product = await prisma.product.update({ where: { id }, data: productData });

  // Categories
  await prisma.productCategory.deleteMany({ where: { productId: id } });
  if (categoryIds?.length) {
    await prisma.productCategory.createMany({
      data: categoryIds.map((catId: string) => ({ productId: id, categoryId: catId })),
    });
  }

  // Badges
  await prisma.productBadge.deleteMany({ where: { productId: id } });
  if (badgeIds?.length) {
    await prisma.productBadge.createMany({
      data: badgeIds.map((badgeId: string) => ({ productId: id, badgeId })),
    });
  }

  // Relations — delete all and recreate
  await prisma.productRelation.deleteMany({ where: { productId: id } });
  if (relations?.length) {
    await prisma.productRelation.createMany({
      data: relations.map((r: any) => ({ productId: id, relatedProductId: r.relatedProductId, type: r.type })),
    });
  }

  return product;
}

export async function deleteProduct(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  // Clean up orphaned reviews before cascade deletes
  await prisma.review.deleteMany({ where: { entityType: 'product', entityId: id } });
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
