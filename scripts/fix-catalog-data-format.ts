// Fix catalog data format — convert {label,value} specs to {key,value}
// Run: npx tsx scripts/fix-catalog-data-format.ts

import { Pool } from 'pg';
import { config } from 'dotenv';
config();

async function main() {
  const p = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

  // ── 1. Fix Product specifications ──
  console.log('=== Product specifications ===');
  const products = await p.query("SELECT id, name, specifications FROM products WHERE specifications IS NOT NULL AND specifications != '[]'");
  let fixed = 0, alreadyOk = 0, empty = 0;

  for (const row of products.rows) {
    let specs: any[];
    try {
      specs = typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications;
    } catch { console.log(`  SKIP ${row.name}: invalid JSON`); continue; }
    if (!Array.isArray(specs) || specs.length === 0) { empty++; continue; }

    // Check if any spec uses {label, value} instead of {key, value}
    const hasLabel = specs.some((s: any) => 'label' in s && !('key' in s));
    if (!hasLabel) { alreadyOk++; continue; }

    const fixedSpecs = specs.map((s: any) => {
      if ('label' in s && !('key' in s)) {
        return { key: s.label, value: s.value };
      }
      return s;
    });

    await p.query('UPDATE products SET specifications = $1 WHERE id = $2', [JSON.stringify(fixedSpecs), row.id]);
    fixed++;
    console.log(`  FIXED ${row.name}: ${specs.length} specs (${specs.filter((s: any) => 'label' in s && !('key' in s)).length} had label→key)`);
  }

  console.log(`\nProducts: ${fixed} fixed, ${alreadyOk} already OK, ${empty} empty`);
  console.log(`Total: ${products.rows.length}`);

  // ── 2. Audit all other JSON fields ──
  console.log('\n=== Audit: all JSON fields ===');

  // Projects
  const projects = await p.query("SELECT id, title, \"storyData\", \"impactData\", \"seoData\", images FROM projects LIMIT 10");
  for (const row of projects.rows) {
    for (const field of ['storyData', 'impactData', 'seoData', 'images']) {
      const v: any = row[field];
      if (v === null) continue;
      const parsed = typeof v === 'string' ? JSON.parse(v) : v;
      const type = Array.isArray(parsed) ? `Array[${parsed.length}]` : typeof parsed === 'object' ? `Object{${Object.keys(parsed).join(',')}}` : typeof parsed;
      console.log(`  ${row.title} ${field}: ${type}`);
    }
  }

  // Testimonials
  const testimonials = await p.query("SELECT id, name, \"draftData\" FROM testimonials LIMIT 5");
  for (const row of testimonials.rows) {
    const v: any = row.draftData;
    const parsed = v ? (typeof v === 'string' ? JSON.parse(v) : v) : null;
    console.log(`  ${row.name} draftData: ${parsed ? 'Object{'+Object.keys(parsed).join(',')+'}' : 'empty'}`);
  }

  // Badges — check if any have string slugs instead of objects
  const badgeCheck = await p.query("SELECT id, name, badges FROM products WHERE badges != '[]' LIMIT 5");
  for (const row of badgeCheck.rows) {
    const v: any = typeof row.badges === 'string' ? JSON.parse(row.badges) : row.badges;
    if (Array.isArray(v) && v.length) {
      const types = v.map((b: any) => typeof b);
      console.log(`  ${row.name} badges: [${types.join(',')}]`);
    }
  }

  await p.end();
}
main().catch(e => { console.error(e); process.exit(1); });
