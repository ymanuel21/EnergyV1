import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const ID = 'p-restore-ms5tqngz-8';

  // Check product_badges for this product
  const pb = await p.query('SELECT pb.*, b.name as badge_name, b.id as badge_exists FROM product_badges pb LEFT JOIN badges b ON b.id = pb."badgeId" WHERE pb."productId" = $1', [ID]);
  console.log('badge relations:', pb.rows.length);
  for (const row of pb.rows) {
    console.log('  badgeId:', row.badgeId, '| badge:', row.badge_name || 'ORPHAN!');
    if (!row.badge_exists) console.log('  *** ORPHAN BADGE — badge record deleted!');
  }

  // Check if badge with that ID exists
  if (pb.rows.length) {
    const b = await p.query('SELECT * FROM badges WHERE id = $1', [pb.rows[0].badgeId]);
    console.log('badge record:', b.rows.length ? 'exists' : 'MISSING');
  }

  // Also check a working product for comparison
  const ID2 = 'p-ms5tn7lc-0'; // Mitsubishi panel (original restore)
  const pb2 = await p.query('SELECT pb.*, b.name FROM product_badges pb JOIN badges b ON b.id = pb."badgeId" WHERE pb."productId" = $1', [ID2]);
  console.log('\nWorking product badges:', pb2.rows.length, pb2.rows.map((r: any) => r.name).join(', '));

  await p.end();
}
main();
