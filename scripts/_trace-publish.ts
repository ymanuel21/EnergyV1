import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
(async () => {
  // Delete all drafts for featured-products — clean slate
  const del = await pool.query(
    `DELETE FROM homepage_section_versions WHERE "sectionId" IN 
     (SELECT id FROM homepage_sections WHERE type = 'featured-products') AND status = 'draft'`
  );
  console.log('Deleted drafts:', del.rowCount);
  
  // Show current state
  const r = await pool.query(
    `SELECT v.status, v."createdAt" FROM homepage_section_versions v
     JOIN homepage_sections s ON s.id = v."sectionId"
     WHERE s.type = 'featured-products' AND s.enabled = true ORDER BY v."createdAt"`
  );
  console.log('Versions:', r.rows.map(r => r.status + ' (' + r.createdAt + ')').join(', '));
  await pool.end();
})();
