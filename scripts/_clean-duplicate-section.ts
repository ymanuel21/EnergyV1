import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
(async () => {
  const dups = await pool.query("SELECT hs.id, hsv.title, hs.enabled, hs.\"sortOrder\" FROM homepage_sections hs LEFT JOIN homepage_section_versions hsv ON hsv.\"sectionId\" = hs.id AND hsv.status = 'published' WHERE hs.type = 'featured-products' ORDER BY hs.\"sortOrder\"");
  for (const r of dups.rows) console.log(r.id.slice(-6), r.title || 'no title', r.enabled);

  // Delete all except first enabled
  const keep = dups.rows.find(r => r.enabled) || dups.rows[0];
  for (const r of dups.rows) {
    if (r.id === keep.id) continue;
    await pool.query("DELETE FROM homepage_section_versions WHERE \"sectionId\" = $1", [r.id]);
    await pool.query("DELETE FROM homepage_sections WHERE id = $1", [r.id]);
    console.log("Deleted duplicate:", r.id.slice(-6));
  }
  
  const after = await pool.query("SELECT count(*)::int as c FROM homepage_sections WHERE type = 'featured-products'");
  console.log("Remaining sections:", after.rows[0].c);
  await pool.end();
})();
