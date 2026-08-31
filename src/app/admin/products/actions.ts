'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { logger } from '@/lib/observability';
import { productCreateSchema } from '@/lib/validations';
import {
  makeReportId,
  toProductCreateError,
  toProductValidationError,
  type ProductCreateResult,
} from '@/lib/product-errors';

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

export async function createProduct(data: any): Promise<ProductCreateResult> {
  const route = '/admin/products/new';

  // 0. Auth — return a structured error instead of throwing raw "Unauthorized".
  try {
    await requireAuth();
  } catch {
    const reportId = makeReportId();
    logger.warn('Product creation unauthorized', {
      reportId,
      operation: 'product.create',
      route,
      errorCode: 'PROD_AUTH_001',
    });
    return {
      success: false,
      code: 'PROD_AUTH_001',
      message: 'Sesi login Anda sudah berakhir. Silakan login kembali lalu coba lagi.',
      reportId,
    };
  }

  const prisma = await getAdminPrisma();

  // 1. Validate the incoming payload (field-specific Indonesian messages).
  const parsed = productCreateSchema.safeParse(data);
  if (!parsed.success) {
    const reportId = makeReportId();
    const err = toProductValidationError(parsed.error.issues, reportId);
    logger.warn('Product creation validation failed', {
      reportId,
      operation: 'product.create',
      route,
      errorCode: err.code,
      field: err.field,
      issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return err;
  }

  const { categoryIds, categoryId, badgeIds, relations, seoTitle, metaDescription, ...productData } = data;

  productData.categoryId = categoryId || (categoryIds?.[0] || null);
  productData.status = 'draft';         // new products start as draft
  productData.draftData = {};           // empty draftData
  productData.isActive = false;         // hidden until published

  try {
    // 2. Create product + link rows in a single transaction so a partial
    //    product is never left behind if a relationship write fails.
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data: productData });

      if (categoryIds?.length) {
        await tx.productCategory.createMany({
          data: categoryIds.map((catId: string) => ({ productId: product.id, categoryId: catId })),
        });
      }
      if (badgeIds?.length) {
        await tx.productBadge.createMany({
          data: badgeIds.map((badgeId: string) => ({ productId: product.id, badgeId })),
        });
      }
      if (relations?.length) {
        await tx.productRelation.createMany({
          data: relations.map((r: any) => ({
            productId: product.id,
            relatedProductId: r.relatedProductId,
            type: r.type,
          })),
        });
      }
    });

    return { success: true };
  } catch (error) {
    const reportId = makeReportId();
    const err = toProductCreateError(error, reportId);

    // Structured diagnostic log (safe metadata only — no secrets).
    logger.error('Product creation failed', {
      reportId,
      operation: 'product.create',
      route,
      errorCode: err.code,
      errorType: (error as { name?: string } | null)?.name ?? typeof error,
      field: err.field,
    });
    // Full original exception stays server-side for debugging (never returned).
    console.error(`[${reportId}] Product creation exception:`, error);

    return err;
  }
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
