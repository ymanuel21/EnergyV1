import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

(async () => {
  const sections = await pool.query(
    `SELECT id, type, enabled, "sortOrder" FROM homepage_sections WHERE type = $1 ORDER BY "sortOrder"`,
    ['featured-products']
  );
  console.log('=== featured-products ===');
  for (const s of sections.rows) {
    console.log(`Section ${s.id.slice(-6)} enabled=${s.enabled}`);
    const vers = await pool.query(
      `SELECT id, status, title, "createdAt" FROM homepage_section_versions WHERE "sectionId" = $1 ORDER BY "createdAt" DESC`,
      [s.id]
    );
    for (const v of vers.rows) console.log(`  ${v.status}: ${v.id.slice(-6)} "${v.title}" (${v.createdAt})`);
    const draft = vers.rows.find((v: any) => v.status === 'draft');
    const pub = vers.rows.find((v: any) => v.status === 'published');
    console.log(`  → Shows: ${(draft || pub)?.status}`);
  }
  await pool.end();
})();
