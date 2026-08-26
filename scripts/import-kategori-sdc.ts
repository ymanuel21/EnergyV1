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
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
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
  ]},
];

// Current-DB name → Excel name (renames). Keys are normalized.
const RENAME_TO_EXCEL: Record<string, string> = {
  'mounting & rangka': 'Mounting',
  'kabel, konektor & proteksi': 'Connector, Cable & Protection',
  'portable power station': 'Portable Power',
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

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })),
  });

  const existing = await prisma.category.findMany({ include: { parent: true, _count: { select: { products: true } } } });
  const byId = new Map(existing.map((c) => [c.id, c]));
  const byNormName = new Map<string, typeof existing[0][]>();
  for (const c of existing) {
    const key = norm(c.name);
    if (!byNormName.has(key)) byNormName.set(key, []);
    byNormName.get(key)!.push(c);
  }

  const plan: string[] = [];
  const usedIds = new Set<string>();
  const log = (m: string) => { console.log(m); plan.push(m); };

  // Find an existing parent by Excel name (or a rename mapping to it).
  function findParent(excelName: string) {
    const key = norm(excelName);
    const direct = byNormName.get(key)?.find((c) => !c.parentId);
    if (direct) return direct;
    // rename reverse-lookup: existing name X where RENAME_TO_EXCEL[norm(X)] === excelName
    for (const [existingKey, target] of Object.entries(RENAME_TO_EXCEL)) {
      if (norm(target) === key) {
        const hit = byNormName.get(existingKey)?.find((c) => !c.parentId);
        if (hit) return hit;
      }
    }
    return undefined;
  }
  function findChild(parentId: string, excelName: string) {
    const key = norm(excelName);
    // 1) direct child of this parent
    const direct = existing.filter((c) => c.parentId === parentId && norm(c.name) === key)[0];
    if (direct) return direct;
    // 2) rename reverse-lookup within this parent
    for (const [existingKey, target] of Object.entries(RENAME_TO_EXCEL)) {
      if (norm(target) === key) {
        const hit = existing.filter((c) => c.parentId === parentId && norm(c.name) === existingKey)[0];
        if (hit) return hit;
      }
    }
    // 3) fallback: orphan/top-level with the same name that must be reparented
    //    (e.g. "Microinverter" currently top-level → move under Inverter)
    return byNormName.get(key)?.find((c) => !usedIds.has(c.id)) ?? undefined;
  }

  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}\n`);

  let parentPos = 0;
  for (const parent of EXCEL) {
    const pName = parent.name;
    let p = findParent(pName);
    const isNewParent = !p;
    if (isNewParent) {
      const id = `cat-${Date.now()}-${parentPos}-${Math.random().toString(36).slice(2, 6)}`;
      log(`CREATE parent "${pName}" (color ${parent.color})`);
      if (APPLY) {
        p = await prisma.category.create({ data: { id, name: pName, slug: slugify(pName), sortOrder: parentPos, color: parent.color } });
      } else {
        p = { id, name: pName, slug: slugify(pName), sortOrder: parentPos, color: parent.color, isActive: true, parentId: null } as any;
      }
    } else {
      const changes: string[] = [];
      if (p.name !== pName) changes.push(`name "${p.name}"→"${pName}"`);
      if (p.color !== parent.color) changes.push(`color ${p.color ?? 'null'}→${parent.color}`);
      if (p.sortOrder !== parentPos) changes.push(`sortOrder ${p.sortOrder}→${parentPos}`);
      if (p.parentId !== null) changes.push(`reparent to null (was ${p.parentId})`);
      log(`${changes.length ? 'UPDATE' : 'KEEP'} parent "${pName}" (${p.id})${changes.length ? ': ' + changes.join(', ') : ''}`);
      if (APPLY) {
        await prisma.category.update({ where: { id: p.id }, data: { name: pName, color: parent.color, sortOrder: parentPos, parentId: null } });
      }
    }
    usedIds.add(p!.id);

    let childPos = 0;
    for (const child of parent.children) {
      let c = findChild(p!.id, child.name);
      const isNewChild = !c;
      const childSlug = `${slugify(pName)}-${slugify(child.name)}`;
      if (isNewChild) {
        const cid = `sub-${Date.now()}-${parentPos}-${childPos}-${Math.random().toString(36).slice(2, 6)}`;
        log(`  CREATE child "${child.name}" under "${pName}"`);
        if (APPLY) {
          c = await prisma.category.create({ data: { id: cid, name: child.name, slug: childSlug, parentId: p!.id, sortOrder: childPos } });
        } else {
          c = { id: cid, name: child.name, slug: childSlug, parentId: p!.id, sortOrder: childPos, color: null, isActive: true } as any;
        }
      } else {
        const cchanges: string[] = [];
        if (c.name !== child.name) cchanges.push(`name "${c.name}"→"${child.name}"`);
        if (c.parentId !== p!.id) cchanges.push(`reparent ${c.parentId ?? 'null'}→${p!.id}`);
        if (c.sortOrder !== childPos) cchanges.push(`sortOrder ${c.sortOrder}→${childPos}`);
        log(`  ${cchanges.length ? 'UPDATE' : 'KEEP'} child "${child.name}" (${c.id})${cchanges.length ? ': ' + cchanges.join(', ') : ''}`);
        if (APPLY) {
          await prisma.category.update({ where: { id: c.id }, data: { name: child.name, parentId: p!.id, sortOrder: childPos } });
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
    const pc = c._count.products;
    if (pc > 0) {
      log(`SKIP (has ${pc} products) "${c.name}" (${c.id}) — left active, needs manual decision`);
    } else {
      log(`${c.isActive ? 'DEACTIVATE' : 'already inactive'} "${c.name}" (${c.id}, 0 products)`);
      if (APPLY && c.isActive) {
        await prisma.category.update({ where: { id: c.id }, data: { isActive: false } });
      }
    }
  }

  console.log(`\nPlan has ${plan.length} actions. ${APPLY ? 'APPLIED.' : 'Dry-run — nothing written. Re-run with --apply to apply.'}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Import failed:', e.message);
  process.exit(1);
});
