// Restore catalog from static fallback data
// Safe — aborts if tables already have data
// Run: npx tsx scripts/restore-catalog.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Static data imports
import { products } from '../src/lib/data/products';
import { brands } from '../src/lib/data/brands';
import { categories } from '../src/lib/data/categories';

// ID generation
const genId = (prefix: string, n: number) => `${prefix}-${Date.now().toString(36)}-${n}`;

// ID mappings: old static ID → new DB cuid
const brandIdMap = new Map<string, string>();
const categoryIdMap = new Map<string, string>();
const badgeSlugMap = new Map<string, string>();

// Badge definitions from product usage
const BADGE_DEFS = [
  { slug: 'clearance', name: 'Clearance', color: '#DC2626', bgColor: '#FEF2F2' },
  { slug: 'promo', name: 'Promo', color: '#2563EB', bgColor: '#EFF6FF' },
  { slug: 'cheapest', name: 'Cheapest', color: '#D97706', bgColor: '#FFFBEB' },
];

function collectBadges(): string[] {
  const slugs = new Set<string>();
  for (const p of products) {
    if (Array.isArray((p as any).badges))
      for (const b of (p as any).badges) slugs.add(b);
  }
  return [...slugs];
}

async function restore() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // ── Safety check ──
  const [productCount, categoryCount, brandCount, badgeCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.badge.count(),
  ]);

  if (productCount > 0 || categoryCount > 0 || brandCount > 0) {
    console.log('ABORTING: Catalog tables are not empty.');
    console.log(`Products: ${productCount}, Categories: ${categoryCount}, Brands: ${brandCount}, Badges: ${badgeCount}`);
    await prisma.$disconnect(); await pool.end(); process.exit(1);
  }

  console.log('Safety check passed — restoring catalog...\n');

  let createdBrands = 0, createdCategories = 0, createdBadges = 0, createdProducts = 0;
  let prodCat = 0, prodBadge = 0;
  const missingBrands: string[] = [], missingCategories: string[] = [], missingBadges: string[] = [];

  // ── 1. Brands ──
  console.log('=== Brands ===');
  for (const b of brands) {
    const c = await prisma.brand.create({ data: {
      id: genId('b', createdBrands), name: b.name, slug: b.slug,
      logo: b.logo || null, isActive: true,
    }});
    brandIdMap.set(b.id, c.id);
    createdBrands++;
    console.log(`  ✓ ${b.name}`);
  }

  // ── 2. Categories ──
  console.log('\n=== Categories ===');
  for (const cat of categories) {
    const c = await prisma.category.create({ data: {
      id: genId('cat', createdCategories), name: cat.name, slug: cat.slug,
      parentId: null, isActive: true, sortOrder: 0,
    }});
    categoryIdMap.set(cat.id, c.id);
    createdCategories++;
    console.log(`  ✓ ${cat.name}`);
    if (cat.children) {
      for (const child of cat.children) {
        const uniqueSlug = `${cat.slug}-${child.slug}`; // avoid duplicate slugs across parents
        const cc = await prisma.category.create({ data: {
          id: genId('sub', createdCategories), name: child.name, slug: uniqueSlug,
          parentId: c.id, isActive: true, sortOrder: 0,
        }});
        categoryIdMap.set(child.id, cc.id);
        createdCategories++;
      }
    }
  }

  // ── 3. Badges ──
  console.log('\n=== Badges ===');
  const usedBadges = collectBadges();
  for (const def of BADGE_DEFS) {
    if (!usedBadges.includes(def.slug)) continue;
    const c = await prisma.badge.create({ data: {
      id: genId('bg', createdBadges), slug: def.slug, name: def.name,
      color: def.color, bgColor: def.bgColor, isActive: true, sortOrder: 0,
    }});
    badgeSlugMap.set(def.slug, c.id);
    createdBadges++;
    console.log(`  ✓ ${def.name}`);
  }

  // ── 4. Products ──
  console.log('\n=== Products ===');
  for (const p of products) {
    const newBrandId = brandIdMap.get(p.brandId);
    const newCategoryId = categoryIdMap.get(p.categoryId);
    if (!newBrandId) { missingBrands.push(`${p.name}`); continue; }
    if (!newCategoryId) { missingCategories.push(`${p.name}`); continue; }

    const c = await prisma.product.create({ data: {
      id: genId('p', createdProducts), name: p.name, slug: p.slug,
      description: p.description || '', price: p.price || 0,
      originalPrice: p.originalPrice || null, stock: p.stock || 0,
      sku: p.sku || null, model: (p as any).model || null,
      weight: p.weight || 0, condition: p.condition || 'new',
      warranty: p.warranty || '1 Tahun', images: p.images || [],
      specifications: p.specifications || [], downloads: [], badges: [],
      brandId: newBrandId, categoryId: newCategoryId,
      status: 'draft', draftData: {}, isActive: false,
    }});
    createdProducts++;
    console.log(`  ✓ ${p.name}`);

    await prisma.productCategory.create({ data: { productId: c.id, categoryId: newCategoryId }});
    prodCat++;

    for (const slug of ((p as any).badges || [])) {
      const bid = badgeSlugMap.get(slug);
      if (bid) {
        await prisma.productBadge.create({ data: { productId: c.id, badgeId: bid }});
        prodBadge++;
      } else {
        missingBadges.push(`${p.name}: ${slug}`);
      }
    }
  }

  // ── Report ──
  console.log('\n==================================================');
  console.log('CATALOG RESTORE RESULT');
  console.log('==================================================');
  console.log(`Brands:      ${createdBrands}`);
  console.log(`Categories:  ${createdCategories}`);
  console.log(`Products:    ${createdProducts}`);
  console.log(`Badges:      ${createdBadges}`);
  console.log(`\nRelations:  ${prodCat} product-category, ${prodBadge} product-badge`);
  console.log(`\nValidation:`);
  console.log(`  Missing brand:    ${missingBrands.length} ${missingBrands.join(', ') || ''}`);
  console.log(`  Missing category: ${missingCategories.length} ${missingCategories.join(', ') || ''}`);
  console.log(`  Missing badge:    ${missingBadges.length} ${missingBadges.join(', ') || ''}`);
  console.log('==================================================');
  console.log(`\nAll ${createdProducts} products created as DRAFT. Publish through CMS.`);

  await prisma.$disconnect(); await pool.end();
}
restore().catch(e => { console.error(e); process.exit(1); });
