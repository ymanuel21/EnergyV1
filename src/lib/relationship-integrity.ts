'use server';

import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';

export type Reference = {
  entity: string;   // 'Product', 'Brand', 'Category'
  name: string;     // entity name
  context: string;  // 'Homepage — Featured Products', 'Brand Page', etc.
  url?: string;     // link to the referencing item
};

/* ===== REFERENCE CHECKS ===== */

export async function checkProductReferences(productId: string): Promise<Reference[]> {
  const prisma = await getAdminPrisma();
  const refs: Reference[] = [];

  // Homepage sections
  const sections = await prisma.homepageSection.findMany();
  for (const s of sections) {
    const st = s.settings as any;
    if (Array.isArray(st?.productIds) && st.productIds.includes(productId)) {
      refs.push({ entity: 'Homepage', name: s.title || s.type, context: 'Featured Products Section', url: '/admin/homepage' });
    }
  }

  // Wishlist (stored in client, but we log it)
  // Compare (stored in client)
  // Cart (stored in client)

  return refs;
}

export async function checkBrandReferences(brandId: string): Promise<Reference[]> {
  const prisma = await getAdminPrisma();
  const refs: Reference[] = [];

  // Products under this brand
  const products = await prisma.product.findMany({ where: { brandId }, select: { name: true, slug: true }, take: 20 });
  for (const p of products) {
    refs.push({ entity: 'Product', name: p.name, context: 'Brand association', url: `/produk/${p.slug}` });
  }

  // Homepage sections
  const sections = await prisma.homepageSection.findMany();
  for (const s of sections) {
    const st = s.settings as any;
    if (Array.isArray(st?.brandIds) && st.brandIds.includes(brandId)) {
      refs.push({ entity: 'Homepage', name: s.title || s.type, context: 'Brands Section', url: '/admin/homepage' });
    }
  }

  return refs;
}

export async function checkCategoryReferences(categoryId: string): Promise<Reference[]> {
  const prisma = await getAdminPrisma();
  const refs: Reference[] = [];

  // Products in this category
  const productCategories = await prisma.productCategory.findMany({
    where: { categoryId },
    include: { product: { select: { name: true, slug: true } } },
    take: 20,
  });
  for (const pc of productCategories) {
    refs.push({ entity: 'Product', name: pc.product.name, context: 'Category association', url: `/produk/${pc.product.slug}` });
  }

  // Child categories
  const children = await prisma.category.findMany({ where: { parentId: categoryId }, select: { name: true, slug: true } });
  for (const c of children) {
    refs.push({ entity: 'Category', name: c.name, context: 'Child category', url: `/admin/categories` });
  }

  return refs;
}

/* ===== SAFE DELETE ===== */

export async function safeDeleteProduct(productId: string): Promise<{ success: boolean; blocked: Reference[] }> {
  await requireAuth();
  const refs = await checkProductReferences(productId);
  if (refs.length > 0) return { success: false, blocked: refs };

  const prisma = await getAdminPrisma();
  await prisma.product.delete({ where: { id: productId } });
  return { success: true, blocked: [] };
}

export async function safeDeleteBrand(brandId: string): Promise<{ success: boolean; blocked: Reference[] }> {
  await requireAuth();
  const refs = await checkBrandReferences(brandId);
  if (refs.length > 0) return { success: false, blocked: refs };

  const prisma = await getAdminPrisma();
  await prisma.brand.delete({ where: { id: brandId } });
  return { success: true, blocked: [] };
}

export async function safeDeleteCategory(categoryId: string): Promise<{ success: boolean; blocked: Reference[] }> {
  await requireAuth();
  const refs = await checkCategoryReferences(categoryId);
  if (refs.length > 0) return { success: false, blocked: refs };

  const prisma = await getAdminPrisma();
  await prisma.category.delete({ where: { id: categoryId } });
  return { success: true, blocked: [] };
}
