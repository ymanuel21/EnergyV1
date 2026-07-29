import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const p = await prisma.product.findUnique({ 
    where: { id: "p-restore-ms5tqngz-8" }, 
    include: { relations: true, categories: true, badgeRelations: { include: { badge: true } }, brand: true } 
  });
  if (!p) { console.log("NOT FOUND"); return; }
  console.log("relations:", Array.isArray(p.relations), p.relations.length, JSON.stringify(p.relations));
  console.log("categories:", Array.isArray(p.categories), p.categories.length, JSON.stringify(p.categories[0]?.categoryId));
  console.log("badgeRels:", Array.isArray(p.badgeRelations), p.badgeRelations.length);
  console.log("brand:", p.brand?.name);
  const result = { ...p, relations: p.relations.map((r: any) => ({ id: r.id, productId: r.productId, relatedProductId: r.relatedProductId, type: r.type, relatedProduct: r.relatedProduct })) };
  console.log("mapped relations:", result.relations.length);
  await prisma.$disconnect();
  await pool.end();
}
main();
