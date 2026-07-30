// Add DEFAULT to revisions.id column
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

(async () => {
  // Check current default
  const before = await pool.query(
    `SELECT column_default FROM information_schema.columns 
     WHERE table_name = 'revisions' AND column_name = 'id'`
  );
  console.log('Before:', before.rows[0]?.column_default || 'NULL');

  // Add a uuid-like default using gen_random_uuid() 
  // Or use a simple trigger approach — actually, let's use:
  // ALTER COLUMN id SET DEFAULT (cuid() equivalent)
  // PostgreSQL doesn't have cuid(), use gen_random_uuid()
  try {
    await pool.query(`ALTER TABLE revisions ALTER COLUMN id SET DEFAULT gen_random_uuid()`);
    console.log('OK: Default added — gen_random_uuid()');
  } catch (err: any) {
    console.log('FAIL:', err.message);
  }

  const after = await pool.query(
    `SELECT column_default FROM information_schema.columns 
     WHERE table_name = 'revisions' AND column_name = 'id'`
  );
  console.log('After:', after.rows[0]?.column_default || 'NULL');

  // Test insert
  try {
    const result = await pool.query(
      `INSERT INTO revisions ("entityType", "entityId", data) 
       VALUES ('test', 'test-123', '{"test":true}') 
       RETURNING id`
    );
    console.log('Test insert OK, id:', result.rows[0].id.slice(-6));
    await pool.query('DELETE FROM revisions WHERE id = $1', [result.rows[0].id]);
    console.log('Cleanup OK');
  } catch (err: any) {
    console.log('Test insert FAIL:', err.message);
  }

  await pool.end();
})();
