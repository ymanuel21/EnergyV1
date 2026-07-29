import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const fail = await p.query("SELECT specifications, images, downloads, badges, \"draftData\" FROM products WHERE id = 'p-restore-ms5tqngz-8'");
  const work = await p.query("SELECT specifications, images, downloads, badges, \"draftData\" FROM products WHERE slug LIKE 'ecoflow-%' LIMIT 1");
  
  for (const key of ['specifications','images','downloads','badges','draftData']) {
    const fv = fail.rows[0][key];
    const wv = work.rows[0][key];
    const ft = fv === null ? 'NULL' : typeof fv;
    const wt = wv === null ? 'NULL' : typeof wv;
    console.log(`${key}: FAIL=${ft} WORK=${wt}`);
    if (ft === 'object' && wt === 'object') {
      console.log(`  FAIL keys: ${JSON.stringify(fv).substring(0, 80)}`);
      console.log(`  WORK keys: ${JSON.stringify(wv).substring(0, 80)}`);
    }
  }
  // Also check all other columns
  const allF = await p.query("SELECT * FROM products WHERE id = 'p-restore-ms5tqngz-8'");
  const allW = await p.query("SELECT * FROM products WHERE slug LIKE 'ecoflow-%' LIMIT 1");
  console.log('\n=== ALL COLUMN DIFF (type) ===');
  for (const key of Object.keys(allF.rows[0])) {
    if (key === 'id' || key === 'created_at' || key === 'updated_at') continue;
    const ft = allF.rows[0][key] === null ? 'NULL' : typeof allF.rows[0][key];
    const wt = allW.rows[0][key] === null ? 'NULL' : typeof allW.rows[0][key];
    if (ft !== wt) console.log(`  ${key}: FAIL=${ft} vs WORK=${wt}`);
  }
  await p.end();
}
main();
