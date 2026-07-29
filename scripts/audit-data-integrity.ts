// Permanent data integrity audit
// Run: npx tsx scripts/audit-data-integrity.ts
// Checks: spec format, relations, orphans, invalid statuses

import { Pool } from 'pg';
import { config } from 'dotenv';
config();

function pass(label: string) { console.log(`  PASS  ${label}`); return true; }
function fail(label: string, detail = '') { console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`); return false; }

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  let allOk = true;

  console.log('=== DATA INTEGRITY AUDIT ===\n');

  // ── Product specifications format ──
  console.log('Specifications format:');
  const specs = await p.query("SELECT id, name, specifications FROM products WHERE specifications IS NOT NULL AND specifications != '[]'");
  for (const row of specs.rows) {
    let v: any[];
    try { v = typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications; }
    catch { allOk = !fail(`${row.name}: invalid JSON`); continue; }
    if (!Array.isArray(v)) { allOk = !fail(`${row.name}: not an array`); continue; }
    for (let i = 0; i < v.length; i++) {
      if ('label' in (v[i] || {}) && !('key' in (v[i] || {}))) {
        allOk = !fail(`${row.name}: spec[${i}] uses 'label' instead of 'key'`);
      }
    }
  }
  if (allOk) pass('All product specs use {key,value} format');

  // ── Required relations ──
  console.log('\nRequired relations:');
  const badBrand = await p.query("SELECT COUNT(*) as c FROM products WHERE brand_id = '' OR brand_id IS NULL OR brand_id NOT IN (SELECT id FROM brands)");
  if (parseInt(badBrand.rows[0].c) > 0) allOk = !fail(`Products without valid brand: ${badBrand.rows[0].c}`);
  else pass('All products have valid brands');

  const badCat = await p.query("SELECT COUNT(*) as c FROM products p WHERE NOT EXISTS (SELECT 1 FROM product_categories pc WHERE pc.\"productId\" = p.id)");
  if (parseInt(badCat.rows[0].c) > 0) allOk = !fail(`Products without category: ${badCat.rows[0].c}`);
  else pass('All products have at least one category');

  // ── Orphaned reviews ──
  console.log('\nOrphaned reviews:');
  const orphR = await p.query("SELECT COUNT(*) as c FROM reviews WHERE \"entityType\" = 'product' AND \"entityId\" NOT IN (SELECT id FROM products)");
  if (parseInt(orphR.rows[0].c) > 0) allOk = !fail(`Orphan product reviews: ${orphR.rows[0].c}`);
  else pass('No orphan product reviews');

  const orphP = await p.query("SELECT COUNT(*) as c FROM reviews WHERE \"entityType\" = 'project' AND \"entityId\" NOT IN (SELECT id FROM projects)");
  if (parseInt(orphP.rows[0].c) > 0) allOk = !fail(`Orphan project reviews: ${orphP.rows[0].c}`);
  else pass('No orphan project reviews');

  // ── Invalid status ──
  console.log('\nStatus values:');
  const badStatus = await p.query("SELECT COUNT(*) as c FROM products WHERE status NOT IN ('draft','review','published','archived')");
  if (parseInt(badStatus.rows[0].c) > 0) allOk = !fail(`Products with invalid status: ${badStatus.rows[0].c}`);
  else pass('All product statuses are valid');

  // ── Image URLs ──
  console.log('\nImage URLs:');
  const imgs = await p.query("SELECT id, name, images FROM products WHERE images IS NOT NULL AND images != '[]'");
  let badImgs = 0;
  for (const row of imgs.rows) {
    let v: any[];
    try { v = typeof row.images === 'string' ? JSON.parse(row.images) : row.images; } catch { continue; }
    if (!Array.isArray(v)) continue;
    for (const url of v) {
      if (typeof url !== 'string' || (!url.startsWith('/') && !url.startsWith('http'))) {
        badImgs++;
        break;
      }
    }
  }
  if (badImgs > 0) allOk = !fail(`${badImgs} products with invalid image URLs`);
  else pass('All image URLs are valid');

  console.log(`\n${allOk ? '=== ALL CHECKS PASSED ===' : '=== SOME CHECKS FAILED ==='}`);
  await p.end();
  process.exit(allOk ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
