// Fix project productIds — replace restore slugs with real product slugs
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 });

(async () => {
  // Get this project's current productIds
  const r = await pool.query(`SELECT slug, "productIds" FROM projects WHERE slug=$1`, ['plts-atap-rumah-bandung-54-kwp']);
  const project = r.rows[0];
  console.log('Current productIds:', JSON.stringify(project.productIds));

  // Find real products from PLTS or solar categories
  const products = await pool.query(
    `SELECT slug, name FROM products WHERE slug LIKE 'plts-%' OR slug LIKE 'ecoflow-%' ORDER BY name LIMIT 5`
  );
  console.log('Available products:', products.rows.map((p: any) => `${p.slug} (${p.name})`));

  // Replace with real product slugs
  const newIds = products.rows.slice(0, 2).map((p: any) => p.slug);
  await pool.query(`UPDATE projects SET "productIds"=$1 WHERE slug=$2`, [JSON.stringify(newIds), project.slug]);
  console.log('Updated productIds →', newIds);

  await pool.end();
})();
