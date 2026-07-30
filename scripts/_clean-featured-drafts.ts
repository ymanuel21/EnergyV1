import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
(async () => {
  const hs = await pool.query("SELECT id FROM homepage_sections WHERE type = $1", ["featured-products"]);
  const sid = hs.rows[0].id;
  
  // List all versions
  const all = await pool.query("SELECT id, status, settings FROM homepage_section_versions WHERE \"sectionId\" = $1", [sid]);
  for (const row of all.rows) console.log(row.id.slice(-6), row.status, typeof row.settings);
  
  // Delete ALL
  const d = await pool.query("DELETE FROM homepage_section_versions WHERE \"sectionId\" = $1 AND status = 'draft'", [sid]);
  console.log("Deleted:", d.rowCount);
  
  // Verify
  const after = await pool.query("SELECT count(*)::int as c FROM homepage_section_versions WHERE \"sectionId\" = $1 AND status = 'draft'", [sid]);
  console.log("Drafts remaining:", after.rows[0].c);
  
  await pool.end();
})();
