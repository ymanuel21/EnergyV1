// Import / restructure categories from "Kategori SDC.xlsx".
//
// Source of truth: the extracted structure below (parents, children, colors) was
// read from `/Users/jkp-yusack-dev/Downloads/Kategori SDC.xlsx` (sheet
// "Turunan Katalog") on 2026-08-26. Column B = parent, column C = child, and the
// column-B cell fill color is the parent's visual group color.
//
// SAFETY / REPEATABILITY:
//   - Dry-run by default: prints the full plan, mutates nothing.
//   - `--apply` performs the writes.
//   - Existing categories are UPDATED in place (id + product joins preserved).
//   - New categories are created. Nothing is deleted.
//   - Categories not in the Excel and having 0 products are DEACTIVATED (isActive=false).
//   - Categories not in the Excel but HAVING products are left untouched (warned).
//
// Run: npx tsx scripts/import-kategori-sdc.ts [--apply]
import { Pool } from 'pg';
import 'dotenv/config';

const APPLY = process.argv.includes('--apply');

// ── Extracted from the Excel ──────────────────────────────────────────────
type ExcelChild = { name: string };
type ExcelParent = { name: string; color: string; children: ExcelChild[] };

const EXCEL: ExcelParent[] = [
  { name: 'Panel Surya', color: '#E5B8B7', children: [
    { name: 'Monocrystalline' }, { name: 'Polycrystalline' }, { name: 'Bifacial' },
  ]},
  { name: 'Inverter', color: '#E5B8B7', children: [
    { name: 'On-Grid' }, { name: 'Off-Grid' }, { name: 'Hybrid' }, { name: 'Microinverter' },
  ]},
  { name: 'Baterai', color: '#E5B8B7', children: [
    { name: 'LifePO4' }, { name: 'Rack Mounted' }, { name: 'Wall Mounted' }, { name: 'All-in-One (ESS)' },
  ]},
  { name: 'Solar Charge Controller', color: '#E5B8B7', children: [
    { name: 'MPPT' }, { name: 'PWM' },
  ]},
  { name: 'Mounting', color: '#E5B8B7', children: [
    { name: 'Rooftop' }, { name: 'Canopy' }, { name: 'Ground Mount' },
  ]},
  { name: 'Connector, Cable & Protection', color: '#E5B8B7', children: [
    { name: 'Kabel PV' }, { name: 'Konektor MC4' }, { name: 'MCB / MCCB DC' },
    { name: 'SPD / Arrester' }, { name: 'Combiner Box' },
  ]},
  { name: 'Paket PLTS', color: '#E5B8B7', children: [
    { name: 'On-Grid' }, { name: 'Off-Grid' }, { name: 'Hybrid' },
    { name: 'Home' }, { name: 'Office' }, { name: 'Industry' },
  ]},
  { name: 'Pompa Air Tenaga Surya', color: '#C9DAF8', children: [
    { name: 'Submersible' }, { name: 'Surface' },
  ]},
  { name: 'PJU Tenaga Surya', color: '#D9EAD3', children: [
    { name: 'PJU All-in-One' }, { name: 'PJU Two-in-One' }, { name: 'Lampu Sorot' }, { name: 'Lampu Taman' },
  ]},
  { name: 'Portable Power', color: '#D9D2E9', children: [
    { name: 'Power Station' },
    { name: 'Solar Generator' },
  ]},
];

// Current-DB name → Excel name (renames). Keys are normalized.
// These are the only safe renames — manually verified against DB state.
const RENAME_TO_EXCEL: Record<string, string> = {
  'mounting & rangka': 'Mounting',
  'kabel, konektor & proteksi': 'Connector, Cable & Protection',
  'lithium lifepo4': 'LifePO4',
  'rumah': 'Home',
  'kantor': 'Office',
  'industri': 'Industry',
  'atap / rooftop': 'Rooftop',
  'ground mounting': 'Ground Mount',
  'carport / canopy': 'Canopy',
};

// ── Helpers ────────────────────────────────────────────────────────────────
const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const slugify = (s: string) =>
  s.trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
  product_count: number;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3 });
  const client = await pool.connect();

  // Fetch all categories with product counts via raw SQL
  const res = await client.query(`
    SELECT c.id, c.name, c.slug, c.sort_order, c.is_active, c.parent_id,
           (SELECT COUNT(*) FROM product_categories pc WHERE pc."categoryId" = c.id) AS product_count
    FROM categories c
    ORDER BY c.sort_order ASC
  `);
  const existing: DbCategory[] = res.rows;

  const byNormName = new Map<string, DbCategory[]>();
  for (const c of existing) {
    const key = norm(c.name);
    if (!byNormName.has(key)) byNormName.set(key, []);
    byNormName.get(key)!.push(c);
  }

  const plan: string[] = [];
  const usedIds = new Set<string>();
  const log = (m: string) => { console.log(m); plan.push(m); };

  // Find an existing parent by Excel name (or a rename mapping to it).
  function findParent(excelName: string): DbCategory | undefined {
    const key = norm(excelName);
    const direct = byNormName.get(key)?.find((c) => !c.parent_id);
    if (direct) return direct;
    // rename reverse-lookup: existing name X where RENAME_TO_EXCEL[norm(X)] === excelName
    for (const [existingKey, target] of Object.entries(RENAME_TO_EXCEL)) {
      if (norm(target) === key) {
        const hit = byNormName.get(existingKey)?.find((c) => !c.parent_id);
        if (hit) return hit;
      }
    }
    return undefined;
  }
  function findChild(parentId: string, excelName: string): DbCategory | undefined {
    const key = norm(excelName);
    // 1) direct child of this parent
    const direct = existing.filter((c) => c.parent_id === parentId && norm(c.name) === key)[0];
    if (direct) return direct;
    // 2) rename reverse-lookup within this parent
    for (const [existingKey, target] of Object.entries(RENAME_TO_EXCEL)) {
      if (norm(target) === key) {
        const hit = existing.filter((c) => c.parent_id === parentId && norm(c.name) === existingKey)[0];
        if (hit) return hit;
      }
    }
    // 3) fallback: orphan/top-level with the same name that must be reparented
    //    (e.g. "Microinverter" currently top-level → move under Inverter)
    return byNormName.get(key)?.find((c) => !usedIds.has(c.id));
  }

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}\n`);

  let parentPos = 0;
  for (const parent of EXCEL) {
    const pName = parent.name;
    let p = findParent(pName);
    const isNewParent = !p;
    if (isNewParent) {
      const id = `cat-sdc-${Date.now()}-${parentPos}-${Math.random().toString(36).slice(2, 6)}`;
      log(`CREATE parent "${pName}" (color ${parent.color})`);
      if (APPLY) {
        await client.query(
          `INSERT INTO categories (id, name, slug, sort_order, is_active, parent_id, color) VALUES ($1, $2, $3, $4, true, null, $5)`,
          [id, pName, slugify(pName), parentPos, parent.color]
        );
      }
      p = { id, name: pName, slug: slugify(pName), sort_order: parentPos, is_active: true, parent_id: null, product_count: 0 };
    } else {
      const changes: string[] = [];
      if (p!.name !== pName) changes.push(`name "${p!.name}"→"${pName}"`);
      if (p!.sort_order !== parentPos) changes.push(`sortOrder ${p!.sort_order}→${parentPos}`);
      if (p!.parent_id !== null) changes.push(`reparent to null (was ${p!.parent_id})`);
      log(`${changes.length ? 'UPDATE' : 'KEEP'} parent "${pName}" (${p!.id})${changes.length ? ': ' + changes.join(', ') : ''}`);
      if (APPLY) {
        await client.query(
          `UPDATE categories SET name = $1, sort_order = $2, parent_id = null, color = $3 WHERE id = $4`,
          [pName, parentPos, parent.color, p!.id]
        );
      }
    }
    usedIds.add(p!.id);

    let childPos = 0;
    for (const child of parent.children) {
      let c = findChild(p!.id, child.name);
      const isNewChild = !c;
      const childSlug = `${slugify(pName)}-${slugify(child.name)}`;
      if (isNewChild) {
        const cid = `sub-sdc-${Date.now()}-${parentPos}-${childPos}-${Math.random().toString(36).slice(2, 6)}`;
        log(`  CREATE child "${child.name}" under "${pName}"`);
        if (APPLY) {
          await client.query(
            `INSERT INTO categories (id, name, slug, sort_order, is_active, parent_id) VALUES ($1, $2, $3, $4, true, $5)`,
            [cid, child.name, childSlug, childPos, p!.id]
          );
        }
        c = { id: cid, name: child.name, slug: childSlug, sort_order: childPos, is_active: true, parent_id: p!.id, product_count: 0 };
      } else {
        const cchanges: string[] = [];
        if (c!.name !== child.name) cchanges.push(`name "${c!.name}"→"${child.name}"`);
        if (c!.parent_id !== p!.id) cchanges.push(`reparent ${c!.parent_id ?? 'null'}→${p!.id}`);
        if (c!.sort_order !== childPos) cchanges.push(`sortOrder ${c!.sort_order}→${childPos}`);
        log(`  ${cchanges.length ? 'UPDATE' : 'KEEP'} child "${child.name}" (${c!.id})${cchanges.length ? ': ' + cchanges.join(', ') : ''}`);
        if (APPLY) {
          await client.query(
            `UPDATE categories SET name = $1, parent_id = $2, sort_order = $3 WHERE id = $4`,
            [child.name, p!.id, childPos, c!.id]
          );
        }
      }
      usedIds.add(c!.id);
      childPos++;
    }
    parentPos++;
  }

  // Categories not referenced by the Excel.
  console.log('\n── Categories not in Excel ──');
  for (const c of existing) {
    if (usedIds.has(c.id)) continue;
    const pc = c.product_count;
    if (pc > 0) {
      log(`SKIP (has ${pc} products) "${c.name}" (${c.id}) — left active, needs manual decision`);
    } else {
      log(`${c.is_active ? 'DEACTIVATE' : 'already inactive'} "${c.name}" (${c.id}, 0 products)`);
      if (APPLY && c.is_active) {
        await client.query(`UPDATE categories SET is_active = false WHERE id = $1`, [c.id]);
      }
    }
  }

  // Summary
  console.log(`\n=== DRY-RUN SUMMARY ===`);
  const creates = plan.filter((p) => p.includes('CREATE'));
  const updates = plan.filter((p) => p.includes('UPDATE'));
  const keeps = plan.filter((p) => p.includes('KEEP'));
  const skips = plan.filter((p) => p.includes('SKIP'));
  const deactivates = plan.filter((p) => p.includes('DEACTIVATE'));
  const alreadyInactive = plan.filter((p) => p.includes('already inactive'));
  console.log(`Total planned actions: ${plan.length}`);
  console.log(`  CREATE: ${creates.length} (${creates.filter((p) => p.includes('parent')).length} parents, ${creates.filter((p) => p.includes('child')).length} children)`);
  console.log(`  UPDATE: ${updates.length}`);
  console.log(`  KEEP (no change): ${keeps.length}`);
  console.log(`  SKIP (has products): ${skips.length}`);
  console.log(`  DEACTIVATE (0 products): ${deactivates.length}`);
  console.log(`  Already inactive: ${alreadyInactive.length}`);

  // Colors summary
  console.log(`\n=== COLORS (parent → color) ===`);
  for (const p of EXCEL) {
    console.log(`  ${p.name}: ${p.color}`);
  }

  console.log(`\n${APPLY ? 'APPLIED.' : 'Dry-run — nothing written. Re-run with --apply to apply.'}`);

  client.release();
  await pool.end();
}

main().catch((e) => {
  console.error('Import failed:', e.message);
  process.exit(1);
});
