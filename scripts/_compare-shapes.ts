import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const ID = 'eco-ecoflow-river-3-max-plus-858wh';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Compare RESTORED (p-restore) vs ECOFLOW vs ORIGINAL (p-ms5t)
  const restored = await prisma.product.findFirst({ where: { slug: { startsWith: 'bluetti' } } });
  const ecoflow = await prisma.product.findFirst({ where: { slug: { startsWith: 'ecoflow-river-3-max-plus' } } });
  const original = await prisma.product.findFirst({ where: { slug: { startsWith: 'panel-surya-mitsubishi' } } });

  for (const [label, p] of [['RESTORED', restored], ['ECOFLOW', ecoflow], ['ORIGINAL', original]] as const) {
    if (!p) { console.log(`${label}: NOT FOUND`); continue; }
    console.log(`\n=== ${label}: ${p.name} ===`);
    // Check every JSON column shape
    for (const field of ['specifications', 'images', 'downloads', 'badges', 'draftData']) {
      const v: any = (p as any)[field];
      if (v === null) { console.log(`  ${field}: NULL`); continue; }
      if (typeof v === 'string') { console.log(`  ${field}: STRING="${v.substring(0,50)}"`); continue; }
      if (Array.isArray(v)) {
        console.log(`  ${field}: Array[${v.length}]`);
        if (v.length && typeof v[0] === 'object') console.log(`    first keys: ${Object.keys(v[0]).join(',')}`);
        if (v.length && typeof v[0] === 'string') console.log(`    first: "${v[0].substring(0,40)}"`);
        continue;
      }
      if (typeof v === 'object') {
        console.log(`  ${field}: Object keys=[${Object.keys(v).join(',')}]`);
        continue;
      }
      console.log(`  ${field}: ${typeof v}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}
main();
