import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const r = await p.query("SELECT id, name, slug FROM products WHERE slug LIKE 'ecoflow-%' LIMIT 1");
  const { id, name } = r.rows[0];
  console.log("Product:", name, "| ID:", id);

  const fields = ["specifications","images","downloads","draftData","condition","warranty","model","sku","originalPrice","weight","status","is_active"];
  for (const f of fields) {
    const q = await p.query(`SELECT "${f}" FROM products WHERE id = $1`, [id]);
    const v = q.rows[0][f];
    let type: string;
    if (v === null) type = "NULL";
    else if (Array.isArray(v)) type = `Array[${v.length}]`;
    else if (typeof v === 'object') type = "Object";
    else type = `${typeof v}=${JSON.stringify(v)}`;
    console.log(`  ${f.padEnd(18)} ${type}`);
  }

  // brand
  const b = await p.query("SELECT b.name FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.id = $1", [id]);
  console.log("  brand              ", b.rows[0]?.name || "MISSING");

  // categories count
  const c = await p.query("SELECT COUNT(*) as c FROM product_categories WHERE \"productId\" = $1", [id]);
  console.log("  categories         ", c.rows[0].c);

  // relations
  const rel = await p.query("SELECT COUNT(*) as c FROM product_relations WHERE \"productId\" = $1", [id]);
  console.log("  relations          ", rel.rows[0].c);

  await p.end();
}
main().catch(e => { console.error(e.message); process.exit(1); });
