import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function audit() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

  const tables = [
    'products', 'categories', 'brands', 'badges',
    'product_categories', 'product_badges', 'product_relations', 'product_events',
    'projects', 'testimonials', 'quote_requests', 'reviews', 'admin_users',
    'homepage_sections', 'homepage_section_versions', 'banners', 'articles',
    'faqs', 'assets', 'navigation_links', 'pages', 'settings', 'landing_pages',
    'activity_logs', 'revisions',
  ];

  console.log('=== CMS DATA AUDIT ===\n');
  for (const t of tables) {
    const r = await p.query(`SELECT COUNT(*) as c FROM ${t}`);
    const c = parseInt(r.rows[0].c);
    const status = c > 0 ? 'DATA' : 'EMPTY';
    console.log(`${t.padEnd(32)} ${String(c).padStart(5)}  ${status}`);
  }

  // Integrity
  console.log('\n=== INTEGRITY CHECKS ===');
  const badBrand = await p.query("SELECT COUNT(*) as c FROM products WHERE brandId NOT IN (SELECT id FROM brands)");
  const drafts = await p.query("SELECT COUNT(*) as c FROM products WHERE status = 'draft'");
  console.log(`Products without brand: ${badBrand.rows[0].c}`);
  console.log(`Draft products: ${drafts.rows[0].c}`);

  await p.end();
}
audit().catch(e => { console.error(e); process.exit(1); });
