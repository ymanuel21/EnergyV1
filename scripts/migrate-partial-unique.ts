// Apply migration: drop old UNIQUE, create partial unique indexes
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

async function main() {
  try {
    // Find and drop existing unique constraint
    const r = await pool.query(
      "SELECT conname FROM pg_constraint WHERE conrelid = 'homepage_section_versions'::regclass AND contype = 'u'"
    );
    const name = r.rows[0]?.conname;
    if (name) {
      await pool.query(`ALTER TABLE homepage_section_versions DROP CONSTRAINT "${name}"`);
      console.log('Dropped constraint:', name);
    } else {
      console.log('No unique constraint found — already migrated?');
    }

    // Create partial unique indexes (idempotent)
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_homepage_sv_draft_unique
      ON homepage_section_versions ("sectionId")
      WHERE status = 'draft'
    `);
    console.log('Draft unique index created');

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_homepage_sv_published_unique
      ON homepage_section_versions ("sectionId")
      WHERE status = 'published'
    `);
    console.log('Published unique index created');

    // Verify
    const idx = await pool.query(
      "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'homepage_section_versions' AND indexname LIKE '%homepage_sv%'"
    );
    for (const i of idx.rows) {
      console.log('  Index:', i.indexname);
    }

    console.log('\n✅ Migration applied');
  } catch (e: any) {
    console.error('Migration error:', e.message);
  }
  await pool.end();
}

main();
