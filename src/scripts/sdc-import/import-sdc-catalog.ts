// SDC catalog importer — dry-run / staging / commit.
//
// Run from the repo root:
//   npx tsx src/scripts/sdc-import/import-sdc-catalog.ts --dry-run
//   npx tsx src/scripts/sdc-import/import-sdc-catalog.ts --staging
//   npx tsx src/scripts/sdc-import/import-sdc-catalog.ts --commit   (NOT run by default)
//
// Isolated from the existing flat XLSX importer (src/app/api/admin/products/import-xlsx).
// Deterministic + idempotent: products are matched by slug and sku; ids are
// 'sdc-' + slug (stable, never random). Staging runs inside a transaction and
// forces a rollback, so production is never touched.

import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import ExcelJS from 'exceljs';
import { parseSdcWorkbook } from './parser';
import { normalizeSdcRows, NormalizedProduct } from './normalize';

config({ path: resolve(__dirname, '../../../.env') });

const FILE = '/Users/document/EnergyV1/Katalog Dari SDC v.1.xlsx';

const BRANDS = [
  { slug: 'huawei', name: 'HUAWEI' },
  { slug: 'deye', name: 'Deye' },
  { slug: 'jinko-solar', name: 'Jinko Solar' },
  { slug: 'sungrow', name: 'Sungrow' },
  { slug: 'sun-star-solar', name: 'Sun Star Solar' },
  { slug: 'generic', name: 'Generic' },
];
const NEW_CATEGORY = { slug: 'aksesoris', name: 'Aksesoris' };

const ROLLBACK_SENTINEL = '__SDC_STAGING_ROLLBACK__';

function getPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  return { prisma, pool };
}

async function main() {
  const mode = process.argv.includes('--staging') ? 'staging'
    : process.argv.includes('--commit') ? 'commit'
    : 'dry-run';

  // 1. Parse + normalize (no DB)
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(FILE);
  const ws = wb.getWorksheet('Harga SDC');
  if (!ws) throw new Error('Sheet "Harga SDC" not found');

  const sourceRows = parseSdcWorkbook(ws);
  const { products, conflicts, stats } = normalizeSdcRows(sourceRows);

  // Optional full-dataset dump (JSON) — independent of mode.
  const dumpIdx = process.argv.indexOf('--dump');
  if (dumpIdx !== -1 && process.argv[dumpIdx + 1]) {
    const dumpPath = process.argv[dumpIdx + 1];
    writeFileSync(dumpPath, JSON.stringify({ stats, conflicts, products }, null, 2));
    console.log('DUMP written to ' + dumpPath);
  }

  // 2. DB state (read-only) for CREATE/UPDATE/SKIP classification
  const { prisma, pool } = getPrisma();
  const [existingBrands, existingCategories, existingProducts] = await Promise.all([
    prisma.brand.findMany({ select: { id: true, slug: true, name: true } }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.product.findMany({ select: { id: true, slug: true, sku: true, model: true } }),
  ]);

  const brandSlugSet = new Set(existingBrands.map((b) => b.slug));
  const categorySlugSet = new Set(existingCategories.map((c) => c.slug));
  const existingBySlug = new Map(existingProducts.map((p) => [p.slug, p.id]));
  const existingBySku = new Map(existingProducts.filter((p) => p.sku).map((p) => [p.sku!, p.id]));

  const brandsCreate = BRANDS.filter((b) => !brandSlugSet.has(b.slug));
  const brandsExisting = BRANDS.filter((b) => brandSlugSet.has(b.slug));
  const categoryCreate = NEW_CATEGORY.slug && !categorySlugSet.has(NEW_CATEGORY.slug) ? [NEW_CATEGORY] : [];
  const categoryExisting = [...new Set(products.map((p) => p.categorySlug).filter((s): s is string => !!s))]
    .filter((s) => categorySlugSet.has(s) || s === NEW_CATEGORY.slug && categorySlugSet.has(s));

  let createCount = 0;
  let updateCount = 0;
  const idempotentMatches: string[] = [];
  for (const p of products) {
    const bySlug = existingBySlug.get(p.slug);
    const bySku = p.sku ? existingBySku.get(p.sku) : undefined;
    if (bySlug || bySku) {
      updateCount++;
      idempotentMatches.push(p.slug);
    } else {
      createCount++;
    }
  }

  // 3. Report header
  console.log('═══════════════════════════════════════════════════════════');
  console.log('SDC CATALOG IMPORT — ' + mode.toUpperCase());
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Brands:');
  console.log('  CREATE:  ' + brandsCreate.map((b) => `${b.name}/${b.slug}`).join(', ') || '(none)');
  console.log('  EXISTING:' + brandsExisting.map((b) => ` ${b.name}/${b.slug}`).join(',') || ' (none)');
  console.log('Categories:');
  console.log('  CREATE:  ' + categoryCreate.map((c) => `${c.name}/${c.slug}`).join(', ') || '(none)');
  console.log('  EXISTING:' + categoryExisting.map((s) => ` ${s}`).join(',') || ' (none)');
  console.log('Products:');
  console.log('  CREATE:  ' + createCount);
  console.log('  UPDATE:  ' + updateCount + (idempotentMatches.length ? ' (idempotent matches: ' + idempotentMatches.join(', ') + ')' : ''));
  console.log('  SKIP:    0');
  console.log('  CONFLICT:' + conflicts.length);
  console.log('SKU:');
  console.log('  assigned:          ' + stats.skuAssigned);
  console.log('  NULL:              ' + stats.skuNull);
  console.log('  duplicate prevented:' + stats.skuDuplicate);
  console.log('  invalid prevented:  ' + stats.skuInvalid);
  console.log('  model NULL:         ' + stats.modelNull);
  console.log('familyKey:');
  console.log('  families:            ' + stats.familyCount);
  console.log('  multi-member families:' + stats.familyMultiMember);
  console.log('  ambiguous:           ' + conflicts.length + ' (SG5.0RS cross-section)');
  console.log('Price:');
  console.log('  CONTACT_FOR_PRICE: ' + stats.contactForPrice + ' / ' + stats.products);
  console.log('  (price = 0, per-product priceDisplayMode; global SiteSetting untouched)');

  // 4. Multi-member family list
  const famMap = new Map<string, NormalizedProduct[]>();
  for (const p of products) {
    if (!p.familyKey) continue;
    const arr = famMap.get(p.familyKey) || [];
    arr.push(p);
    famMap.set(p.familyKey, arr);
  }
  console.log('\nMULTI-MEMBER FAMILIES (familyKey -> models):');
  for (const [key, members] of [...famMap.entries()].sort((a, b) => b[1].length - a[1].length)) {
    if (members.length <= 1) continue;
    console.log(`  [${members.length}] ${key}`);
    console.log('        ' + members.map((m) => m.model).join(' | '));
  }

  // 5. Conflicts detail
  if (conflicts.length) {
    console.log('\nCONFLICTS (excluded from import, preserved as source):');
    for (const c of conflicts) {
      console.log(`  row ${c.sourceRow} [${c.band}] model=${c.model} — ${c.reason}`);
      console.log(`      sections: ${c.sections.join(' / ')}`);
      console.log(`      desc: ${c.description}`);
    }
  }

  // 6. Dry-run stops here
  if (mode === 'dry-run') {
    console.log('\nDRY-RUN COMPLETE — no database writes.');
    await prisma.$disconnect();
    await pool.end();
    return;
  }

  // 7. Staging / commit: transaction simulation
  const before = {
    products: await prisma.product.count(),
    brands: await prisma.brand.count(),
    categories: await prisma.category.count(),
  };

  // lookup ids for category linking
  const categoryIdBySlug = new Map(existingCategories.map((c) => [c.slug, c.id]));
  // (brands will be upserted inside tx)

  let stagedWritten = 0;
  let stagedSkipped = 0;
  let stagedVerified = 0;

  try {
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // upsert brands
      const brandIdBySlug = new Map<string, string>();
      for (const b of BRANDS) {
        const existing = await tx.brand.findUnique({ where: { slug: b.slug }, select: { id: true } });
        if (existing) { brandIdBySlug.set(b.slug, existing.id); continue; }
        const created = await tx.brand.create({ data: { id: 'sdc-brand-' + b.slug, name: b.name, slug: b.slug, isActive: true } });
        brandIdBySlug.set(b.slug, created.id);
      }
      // upsert aksesoris category
      let aksesorisId = categoryIdBySlug.get(NEW_CATEGORY.slug);
      if (!aksesorisId) {
        const created = await tx.category.create({ data: { id: 'sdc-cat-aksesoris', name: NEW_CATEGORY.name, slug: NEW_CATEGORY.slug, isActive: true, sortOrder: 0 } });
        aksesorisId = created.id;
        categoryIdBySlug.set(NEW_CATEGORY.slug, created.id);
      }

      // create products + category links (idempotent: skip existing by slug/sku)
      for (const p of products) {
        const existingId = existingBySlug.get(p.slug) || (p.sku ? existingBySku.get(p.sku) : undefined);
        if (existingId) {
          stagedSkipped++;
          continue;
        }
        const brandId = brandIdBySlug.get(p.brandSlug);
        if (!brandId) throw new Error('Missing brand ' + p.brandSlug);
        const catId = p.categorySlug ? categoryIdBySlug.get(p.categorySlug) : null;

        const data: Prisma.ProductUncheckedCreateInput = {
          id: 'sdc-' + p.slug,
          slug: p.slug,
          name: p.name,
          description: p.description || '',
          price: p.price,
          priceDisplayMode: p.priceDisplayMode,
          stock: p.stock,
          sku: p.sku,
          model: p.model,
          capacity: p.capacity,
          familyKey: p.familyKey,
          condition: p.condition,
          status: p.status,
          isActive: p.isActive,
          brandId,
          categoryId: catId ?? undefined,
          specifications: p.specifications as unknown as Prisma.InputJsonValue,
        };
        await tx.product.create({ data });
        stagedWritten++;
        if (catId) {
          await tx.productCategory.create({ data: { productId: 'sdc-' + p.slug, categoryId: catId } });
        }
      }

      // verify inside transaction
      stagedVerified = await tx.product.count({ where: { id: { startsWith: 'sdc-' } } });

      if (mode === 'staging') {
        throw new Error(ROLLBACK_SENTINEL);
      }
      // commit mode falls through and commits
    }, { timeout: 180000 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes(ROLLBACK_SENTINEL)) {
      console.log('\nSTAGING: transaction completed, now rolling back (sentinel).');
    } else {
      console.error('\nSTAGING ERROR:', msg);
      await prisma.$disconnect();
      await pool.end();
      process.exit(1);
    }
  }

  const after = {
    products: await prisma.product.count(),
    brands: await prisma.brand.count(),
    categories: await prisma.category.count(),
  };

  console.log('\nDatabase:');
  console.log('  rows written:         ' + stagedWritten + ' products (+ brands/categories)');
  console.log('  rows skipped (idempotent): ' + stagedSkipped);
  console.log('  rows verified in tx:  ' + stagedVerified + ' products with id sdc-*');
  if (mode === 'staging') {
    console.log('  rows rolled back:     ' + stagedWritten);
    console.log('  final production delta: products ' + (after.products - before.products) +
      ', brands ' + (after.brands - before.brands) +
      ', categories ' + (after.categories - before.categories));
    if (after.products === before.products && after.brands === before.brands && after.categories === before.categories) {
      console.log('  ✓ production unchanged — rollback verified.');
    } else {
      console.log('  ✗ PRODUCTION CHANGED — investigate immediately.');
    }
  } else {
    console.log('  final production delta: products +' + (after.products - before.products) +
      ', brands +' + (after.brands - before.brands) +
      ', categories +' + (after.categories - before.categories));
    console.log('  ✓ import committed to production.');
  }

  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
