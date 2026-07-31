import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 });

(async () => {
  const client = await pool.connect();
  try {
    const { rows: projects } = await client.query(`SELECT id, title, slug, "productIds" FROM projects`);
    console.log(`Found ${projects.length} projects`);

    for (const proj of projects) {
      const raw = proj.productIds;
      if (!raw || !Array.isArray(raw) || raw.length === 0) {
        console.log(`  ${proj.slug}: empty — skip`);
        continue;
      }

      const normalized: { slug: string; quantity: number }[] = [];
      for (const item of raw) {
        if (typeof item === 'string') {
          const bySlug = await client.query(`SELECT slug FROM products WHERE slug=$1`, [item]);
          if (bySlug.rows.length > 0) {
            normalized.push({ slug: item, quantity: 1 });
          } else {
            const byId = await client.query(`SELECT slug FROM products WHERE id=$1`, [item]);
            if (byId.rows.length > 0) {
              normalized.push({ slug: byId.rows[0].slug, quantity: 1 });
            }
          }
        } else if (typeof item === 'object' && item.slug) {
          const s = item.slug;
          if (s.startsWith('p-ms5') || s.startsWith('cms')) {
            const byId = await client.query(`SELECT slug FROM products WHERE id=$1`, [s]);
            if (byId.rows.length > 0) {
              normalized.push({ slug: byId.rows[0].slug, quantity: item.quantity || 1 });
            }
          } else {
            normalized.push({ slug: s, quantity: item.quantity || 1 });
          }
        }
      }

      const before = JSON.stringify(raw).length;
      const after = JSON.stringify(normalized).length;
      console.log(`  ${proj.slug}: ${raw.length} items ${before !== after ? '→ migrated' : ''}`);

      await client.query(`UPDATE projects SET "productIds"=$1 WHERE id=$2`, [JSON.stringify(normalized), proj.id]);
    }
    console.log('\nDone');
  } finally {
    client.release();
    await pool.end();
  }
})();
