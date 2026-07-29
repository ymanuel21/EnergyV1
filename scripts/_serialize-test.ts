import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const ID = 'p-restore-ms5tqngz-8';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Simulate EXACTLY what getProduct does
  const product = await prisma.product.findUnique({
    where: { id: ID },
    include: {
      brand: true,
      categories: { include: { category: true } },
      badgeRelations: { include: { badge: true } },
      relations: { include: { relatedProduct: { select: { id: true, name: true, price: true, brand: { select: { name: true } } } } } },
    },
  });

  if (!product) { console.log('NOT FOUND'); return; }

  // Try to JSON.stringify — this is what happens during RSC serialization
  try {
    const serialized = JSON.stringify(product);
    console.log('JSON.stringify OK, length:', serialized.length);
  } catch (e: any) {
    console.log('JSON.stringify CRASH:', e.message);
  }

  // Try getProduct return value
  try {
    const result = {
      ...product,
      relations: product.relations.map((r: any) => ({
        id: r.id, productId: r.productId, relatedProductId: r.relatedProductId,
        type: r.type, relatedProduct: r.relatedProduct,
      })),
    };
    const s = JSON.stringify(result);
    console.log('getProduct JSON OK, length:', s.length);
  } catch (e: any) {
    console.log('getProduct JSON CRASH:', e.message);
  }

  // Check category chain for circular refs
  try {
    for (const pc of product.categories) {
      const catJson = JSON.stringify(pc.category);
      console.log('  category JSON OK, length:', catJson.length);
    }
  } catch (e: any) {
    console.log('category JSON CRASH:', e.message);
  }

  // Check badge chain
  try {
    for (const br of product.badgeRelations) {
      const bJson = JSON.stringify(br.badge);
      console.log('  badge JSON OK, length:', bJson.length);
    }
  } catch (e: any) {
    console.log('badge JSON CRASH:', e.message);
  }

  // Check brand
  try {
    if (product.brand) {
      const bJson = JSON.stringify(product.brand);
      console.log('  brand JSON OK, length:', bJson.length);
    }
  } catch (e: any) {
    console.log('brand JSON CRASH:', e.message);
  }

  await prisma.$disconnect();
  await pool.end();
}
main();
