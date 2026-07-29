import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Get the EXACT product + EXACT categories include
  const product = await prisma.product.findUnique({
    where: { id: 'p-restore-ms5tqngz-8' },
    include: {
      brand: true,
      categories: { include: { category: true } },
      badgeRelations: { include: { badge: true } },
      relations: { include: { relatedProduct: { select: { id: true, name: true, price: true, brand: { select: { name: true } } } } } },
    },
  });

  if (!product) { console.log('NOT FOUND'); await prisma.$disconnect(); await pool.end(); return; }

  // Check for Prisma-specific non-serializable fields
  console.log('=== Non-serializable check ===');
  function check(obj: any, path = 'root') {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val === null || val === undefined) continue;
      if (val instanceof Date) { console.log(`  DATE: ${path}.${key} = ${val.toISOString()}`); }
      else if (typeof val === 'object' && !Array.isArray(val)) {
        if (val.constructor && val.constructor.name !== 'Object') {
          console.log(`  NON-PLAIN: ${path}.${key} = ${val.constructor.name}`);
        }
        check(val, `${path}.${key}`);
      }
    }
  }
  check(product);

  // Check categories specifically
  console.log('\n=== Categories ===');
  for (const pc of product.categories) {
    console.log('  cat keys:', Object.keys(pc));
    console.log('  cat.category keys:', Object.keys(pc.category).length, Object.keys(pc.category).slice(0, 10).join(','));
    // Check if category has any getters or non-enumerable properties
    const descs = Object.getOwnPropertyDescriptors(pc.category);
    for (const [k, d] of Object.entries(descs)) {
      if (d.get) console.log(`  GETTER: category.${k}`);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}
main();
