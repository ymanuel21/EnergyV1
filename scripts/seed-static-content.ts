// Seed recoverable static data into DB
// Idempotent — checks uniqueness before inserting
// Run: npx tsx scripts/seed-static-content.ts

import { Pool } from 'pg';
import { config } from 'dotenv';
import { articles } from '../src/lib/data/articles';
import { banners } from '../src/lib/data/banners';
import { staticPages } from '../src/lib/data/static-pages';
config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

  console.log('=== Static Content → DB Migration ===\n');

  // ── 1. Banners ──
  console.log('BANNERS:');
  let bCreated = 0, bExisted = 0;
  for (const b of banners) {
    const exists = await pool.query('SELECT id FROM banners WHERE src = $1 OR title = $2', [b.src, b.alt]);
    if (exists.rows.length > 0) {
      bExisted++;
      console.log(`  → ${b.alt} (exists)`);
    } else {
      const id = 'banner-' + Date.now().toString(36) + '-' + bCreated;
      await pool.query(
        `INSERT INTO banners (id, type, title, src, alt, link, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, 'hero', b.alt, b.src, b.alt, b.href || null, true]
      );
      bCreated++;
      console.log(`  ✓ ${b.alt}`);
    }
  }
  console.log(`  → ${bCreated} new, ${bExisted} existed, ${banners.length} total\n`);

  // ── 2. Articles ──
  console.log('ARTICLES:');
  let aCreated = 0, aExisted = 0;
  for (const a of articles) {
    const exists = await pool.query('SELECT id FROM articles WHERE slug = $1', [a.slug]);
    if (exists.rows.length > 0) {
      aExisted++;
      console.log(`  → ${a.title} (exists)`);
    } else {
      await pool.query(
        `INSERT INTO articles (id, title, slug, excerpt, content, category, image, author, read_time, is_published, published_at, updated_at)
         VALUES (gen_random_uuid(), $1,$2,$3,$4,$5,$6,$7,$8,true,NOW(),NOW())`,
        [a.title, a.slug, a.excerpt, a.content, a.category, a.image || null, a.author, a.readTime]
      );
      aCreated++;
      console.log(`  ✓ ${a.title}`);
    }
  }
  console.log(`  → ${aCreated} new, ${aExisted} existed, ${articles.length} total\n`);

  // ── 3. Static Pages ──
  console.log('STATIC PAGES:');
  let sCreated = 0, sExisted = 0;
  for (const sp of staticPages) {
    const exists = await pool.query('SELECT id FROM pages WHERE slug = $1', [sp.slug]);
    if (exists.rows.length > 0) {
      sExisted++;
      console.log(`  → ${sp.title} (exists)`);
    } else {
      const id = 'page-' + sp.slug;
      await pool.query(
        `INSERT INTO pages (id, slug, title, content, updated_at) VALUES ($1,$2,$3,$4,NOW())`,
        [id, sp.slug, sp.title, sp.content]
      );
      sCreated++;
      console.log(`  ✓ ${sp.title}`);
    }
  }
  console.log(`  → ${sCreated} new, ${sExisted} existed, ${staticPages.length} total\n`);

  // ── Verify counts ──
  console.log('=== VERIFICATION ===');
  const [bCount, aCount, sCount] = await Promise.all([
    pool.query('SELECT COUNT(*) as c FROM banners'),
    pool.query('SELECT COUNT(*) as c FROM articles'),
    pool.query('SELECT COUNT(*) as c FROM pages'),
  ]);
  
  const results = [
    { label: 'Banner', actual: parseInt(bCount.rows[0].c), expected: 2 },
    { label: 'Article', actual: parseInt(aCount.rows[0].c), expected: 4 },
    { label: 'StaticPage', actual: parseInt(sCount.rows[0].c), expected: 5 },
  ];

  let allMatch = true;
  for (const r of results) {
    const match = r.actual === r.expected;
    if (!match) allMatch = false;
    console.log(`  ${r.label.padEnd(12)} expected: ${r.expected}  actual: ${r.actual}  ${match ? '✅' : '❌ MISMATCH'}`);
  }

  if (allMatch) console.log('\n✅ ALL COUNTS MATCH');
  else console.log('\n❌ COUNT MISMATCH — investigate');

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
