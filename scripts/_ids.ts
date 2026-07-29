import { Pool } from 'pg';
import { config } from 'dotenv';
config();
async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const r = await p.query("SELECT id, name FROM products ORDER BY id");
  let restored = 0, ecoflow = 0, manual = 0;
  for (const row of r.rows) {
    if (row.id.startsWith('p-restore')) restored++;
    else if (row.id.startsWith('eco-')) ecoflow++;
    else manual++;
    console.log(`  [${row.id.substring(0,10)}] ${(row as any).name.substring(0, 45)}`);
  }
  console.log(`\nRestored: ${restored}  EcoFlow: ${ecoflow}  Other: ${manual}`);
  await p.end();
}
main();
