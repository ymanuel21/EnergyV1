// Data integrity check — validates referential integrity across CMS
// Run: npx tsx scripts/check-data-integrity.ts

import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function check(label: string, fn: () => Promise<number>): Promise<boolean> {
  const count = await fn();
  const ok = count === 0;
  console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (ok ? '' : ` (${count})`));
  return ok;
}

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  let ok = true;

  console.log('=== CMS DATA INTEGRITY CHECK ===\nCatalog:');
  ok = ok && await check('Products without brand', async () => {
    const r = await p.query('SELECT COUNT(*) as c FROM products WHERE brand_id NOT IN (SELECT id FROM brands)');
    return parseInt(r.rows[0].c);
  });
  ok = ok && await check('Products without category', async () => {
    const r = await p.query('SELECT COUNT(*) as c FROM products WHERE category_id NOT IN (SELECT id FROM categories)');
    return parseInt(r.rows[0].c);
  });
  ok = ok && await check('Brands table empty', async () => {
    const r = await p.query('SELECT COUNT(*) as c FROM brands');
    return parseInt(r.rows[0].c) === 0 ? 1 : 0;
  });

  console.log('\nReviews:');
  ok = ok && await check('Orphan reviews (deleted products)', async () => {
    const r = await p.query('SELECT COUNT(*) as c FROM reviews WHERE "entityType" = \'product\' AND "entityId" NOT IN (SELECT id FROM products)');
    return parseInt(r.rows[0].c);
  });
  ok = ok && await check('Orphan reviews (deleted projects)', async () => {
    const r = await p.query('SELECT COUNT(*) as c FROM reviews WHERE "entityType" = \'project\' AND "entityId" NOT IN (SELECT id FROM projects)');
    return parseInt(r.rows[0].c);
  });

  console.log('\nHomepage:');
  ok = ok && await check('Sections without versions', async () => {
    const r = await p.query('SELECT COUNT(*) as c FROM homepage_sections WHERE id NOT IN (SELECT "sectionId" FROM homepage_section_versions)');
    return parseInt(r.rows[0].c);
  });

  console.log('\nProjects / Testimonials:');
  ok = ok && await check('Projects without title', async () => {
    const r = await p.query("SELECT COUNT(*) as c FROM projects WHERE title = '' OR title IS NULL");
    return parseInt(r.rows[0].c);
  });
  ok = ok && await check('Testimonials without name', async () => {
    const r = await p.query("SELECT COUNT(*) as c FROM testimonials WHERE name = '' OR name IS NULL");
    return parseInt(r.rows[0].c);
  });

  const result = ok ? '\nALL 10 CHECKS PASSED' : '\nSOME CHECKS FAILED';
  console.log(result);
  await p.end();
  process.exit(ok ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(1); });
