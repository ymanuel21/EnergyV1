import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const ID = 'p-restore-ms5tqngz-8';

  // 1. Full dump of failing product
  console.log('=== FAILING PRODUCT ===');
  const fail = await p.query('SELECT * FROM products WHERE id = $1', [ID]);
  if (fail.rows.length === 0) { console.log('PRODUCT NOT FOUND'); process.exit(1); }
  const fr = fail.rows[0];
  for (const [k, v] of Object.entries(fr)) {
    const val = v === null ? 'NULL' : typeof v === 'object' ? JSON.stringify(v).substring(0, 100) : String(v).substring(0, 100);
    console.log(`  ${k}: ${val}`);
  }

  // Relations
  console.log('\n=== RELATIONS ===');
  const cats = await p.query('SELECT c.name FROM product_categories pc JOIN categories c ON c.id = pc."categoryId" WHERE pc."productId" = $1', [ID]);
  console.log('  categories:', cats.rows.length, cats.rows.map((r: any) => r.name).join(', '));
  const eb = await p.query('SELECT b.name FROM product_badges pb JOIN badges b ON b.id = pb."badgeId" WHERE pb."productId" = $1', [ID]);
  console.log('  badges:', eb.rows.length, eb.rows.map((r: any) => r.name).join(', '));
  const rels = await p.query('SELECT COUNT(*) as c FROM product_relations WHERE "productId" = $1', [ID]);
  console.log('  relations:', rels.rows[0].c);
  const b = await p.query('SELECT name FROM brands WHERE id = $1', [fr.brand_id]);
  console.log('  brand:', b.rows[0]?.name || 'MISSING!');

  // 2. Compare with working product
  console.log('\n=== FIELD DIFF vs ECOFLOW ===');
  const work = await p.query("SELECT * FROM products WHERE slug LIKE 'ecoflow-%' LIMIT 1");
  const wr = work.rows[0];
  const allKeys = new Set([...Object.keys(fr), ...Object.keys(wr)]);
  for (const key of allKeys) {
    if (key === 'id' || key === 'createdAt' || key === 'updatedAt') continue;
    const fv: any = fr[key];
    const wv: any = wr[key];
    const ft = fv === null ? 'NULL' : Array.isArray(fv) ? 'Array' : typeof fv === 'object' ? 'Object' : typeof fv;
    const wt = wv === null ? 'NULL' : Array.isArray(wv) ? 'Array' : typeof wv === 'object' ? 'Object' : typeof wv;
    if (ft !== wt) {
      console.log(`  DIFF ${key}: FAIL=${ft} vs WORK=${wt}`);
    }
  }

  // 3. Check specifically for weird values
  console.log('\n=== SUSPICIOUS VALUES ===');
  const suspicious = ['specifications', 'images', 'downloads', 'badges', 'draftData', 'productIds'];
  for (const key of suspicious) {
    const v: any = fr[key];
    if (v === null) console.log(`  ${key}: NULL`);
    else if (typeof v === 'string') console.log(`  ${key}: string="${v.substring(0, 50)}"`);
    else if (typeof v === 'object') console.log(`  ${key}: ${JSON.stringify(v).substring(0, 100)}`);
  }

  await p.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
