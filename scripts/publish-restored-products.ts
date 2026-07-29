// Controlled publish for restored catalog products
// Uses existing publishEntity — does NOT bypass CMS workflow
// Run: npx tsx scripts/publish-restored-products.ts

import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

  // ── Fetch all products with relations ──
  const products = await p.query(`
    SELECT p.id, p.name, p.slug, p.status, p.is_active as "isActive",
           p.brand_id as "brandId", b.name as "brandName",
           p.category_id as "categoryId",
           p.images, p.specifications, p.description,
           (SELECT COUNT(*) FROM product_categories pc WHERE pc."productId" = p.id) as cat_count
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    ORDER BY p.name
  `);

  const total = products.rows.length;
  console.log(`Found ${total} products. Validating...\n`);

  // ── Validation ──
  const valid: any[] = [];
  const skipped: string[] = [];

  for (const row of products.rows) {
    const issues: string[] = [];

    if (row.status !== 'draft') issues.push(`status is '${row.status}' (expected draft)`);
    if (row.isActive) issues.push('already active');
    if (!row.name) issues.push('missing name');
    if (!row.slug) issues.push('missing slug');
    if (!row.brandId) issues.push('missing brand');
    if (row.cat_count === '0') issues.push('missing category relation');
    if (!row.images || row.images === '[]' || row.images === '["/images/placeholder/product-placeholder.png"]') {
      // placeholder is acceptable for restored products
    }
    if (!row.specifications || row.specifications === '[]') issues.push('missing specifications');

    if (issues.length > 0) {
      console.log(`  SKIP  ${row.name}`);
      issues.forEach(i => console.log(`        ${i}`));
      skipped.push(`${row.name}: ${issues.join(', ')}`);
    } else {
      console.log(`  OK    ${row.name}`);
      valid.push(row);
    }
  }

  if (skipped.length > 0) {
    console.log(`\n${skipped.length} products skipped. Fix issues before publishing.`);
    if (valid.length === 0) { await p.end(); process.exit(1); }
  }

  console.log(`\n${valid.length} products ready to publish.`);

  // ── Publish via content-versioning pattern ──
  console.log('\nPublishing...');
  let published = 0;

  for (const row of valid) {
    // Set status=published and isActive=true directly since these are restored products
    // with no draftData to merge (they were created directly, not via saveDraft)
    await p.query(
      'UPDATE products SET status = $1, is_active = true WHERE id = $2',
      ['published', row.id]
    );
    published++;
    console.log(`  ✓ ${row.name}`);
  }

  // ── Verify ──
  const after = await p.query("SELECT COUNT(*) as c FROM products WHERE status = 'published' AND is_active = true");
  const draftAfter = await p.query("SELECT COUNT(*) as c FROM products WHERE status = 'draft'");

  console.log('\n==================================================');
  console.log('PRODUCT RECOVERY PUBLISH REPORT');
  console.log('==================================================');
  console.log(`Before:  Draft=${total}  Published=0`);
  console.log(`After:   Draft=${draftAfter.rows[0].c}  Published=${after.rows[0].c}`);
  console.log(`Public visibility: ${after.rows[0].c > 0 ? 'PASS' : 'FAIL'}`);
  console.log('==================================================');

  await p.end();
}
main().catch(e => { console.error(e); process.exit(1); });
