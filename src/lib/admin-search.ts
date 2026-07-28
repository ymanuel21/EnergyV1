'use server';

import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';
import { moduleRegistry } from '@/lib/module-registry';

export interface RelationResult {
  module: string;
  icon: string;
  label: string;
  route: string;
  count: number;
}

export async function getEntityRelations(entityType: string, entityId: string): Promise<RelationResult[]> {
  const prisma = await getAdminPrisma();
  const results: RelationResult[] = [];

  if (entityType === 'products') {
    // Check homepage featured sections
    const sections = await prisma.homepageSection.findMany({ where: { type: 'featured-products' } });
    let count = 0;
    for (const s of sections) {
      const st = s.settings as any;
      if (Array.isArray(st?.productIds) && st.productIds.includes(entityId)) count++;
    }
    if (count > 0) results.push({ module: 'homepage', icon: '🏠', label: 'Homepage — Featured Products', route: '/admin/homepage', count });

    // ProductCategory
    const pcCount = await prisma.productCategory.count({ where: { productId: entityId } });
    if (pcCount > 0) results.push({ module: 'categories', icon: '📂', label: 'Categories', route: '/admin/categories', count: pcCount });
  }

  if (entityType === 'brands') {
    const productCount = await prisma.product.count({ where: { brandId: entityId } });
    if (productCount > 0) results.push({ module: 'products', icon: '📦', label: 'Products', route: '/admin/products', count: productCount });

    const sections = await prisma.homepageSection.findMany({ where: { type: 'brands' } });
    let bc = 0;
    for (const s of sections) {
      const st = s.settings as any;
      if (Array.isArray(st?.brandIds) && st.brandIds.includes(entityId)) bc++;
    }
    if (bc > 0) results.push({ module: 'homepage', icon: '🏠', label: 'Homepage — Brands Section', route: '/admin/homepage', count: bc });
  }

  if (entityType === 'categories') {
    const pcCount = await prisma.productCategory.count({ where: { categoryId: entityId } });
    if (pcCount > 0) results.push({ module: 'products', icon: '📦', label: 'Products', route: '/admin/products', count: pcCount });

    const childCount = await prisma.category.count({ where: { parentId: entityId } });
    if (childCount > 0) results.push({ module: 'categories', icon: '📂', label: 'Child Categories', route: '/admin/categories', count: childCount });
  }

  return results;
}

export async function globalSearch(query: string) {
  if (!query || query.length < 2) return [];
  const prisma = await getAdminPrisma();
  const results: { module: string; icon: string; label: string; route: string; match: string }[] = [];

  // Products
  const products = await prisma.product.findMany({ where: { name: { contains: query } }, take: 5, select: { name: true, slug: true } });
  for (const p of products) results.push({ module: 'products', icon: '📦', label: p.name, route: `/admin/products`, match: p.name });

  // Brands
  const brands = await prisma.brand.findMany({ where: { name: { contains: query } }, take: 3, select: { name: true, id: true } });
  for (const b of brands) results.push({ module: 'brands', icon: '🏢', label: b.name, route: `/admin/brands`, match: b.name });

  // Categories
  const cats = await prisma.category.findMany({ where: { name: { contains: query } }, take: 3, select: { name: true, id: true } });
  for (const c of cats) results.push({ module: 'categories', icon: '📂', label: c.name, route: `/admin/categories`, match: c.name });

  // Homepage sections
  const sections = await prisma.homepageSection.findMany({ where: { title: { contains: query } }, take: 3, select: { title: true, id: true } });
  for (const s of sections) results.push({ module: 'homepage', icon: '🏠', label: s.title || 'Untitled', route: `/admin/homepage`, match: s.title || '' });

  // Navigation links
  const nav = await prisma.navigationLink.findMany({ where: { label: { contains: query } }, take: 3, select: { label: true, id: true } });
  for (const n of nav) results.push({ module: 'navigation', icon: '🧭', label: n.label, route: `/admin/navigation`, match: n.label });

  return results;
}
