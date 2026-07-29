import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const ID = 'p-restore-ms5tqngz-8';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

console.log('=== getProduct simulation ===');
try {
  const product = await prisma.product.findUnique({
    where: { id: ID },
    include: {
      brand: true,
      categories: { include: { category: true } },
      badgeRelations: { include: { badge: true } },
      relations: { include: { relatedProduct: { select: { id: true, name: true, price: true, brand: { select: { name: true } } } } } },
    },
  });

  if (!product) { console.log('PRODUCT NOT FOUND'); process.exit(1); }

  console.log('brand:', product.brand?.name);
  console.log('categories:', product.categories.length);
  console.log('badgeRelations:', product.badgeRelations.length);
  console.log('relations:', product.relations.length);

  const result = {
    ...product,
    relations: product.relations.map((r: any) => ({
      id: r.id, productId: r.productId, relatedProductId: r.relatedProductId,
      type: r.type, relatedProduct: r.relatedProduct,
    })),
  };
  console.log('mapped relations:', result.relations.length);
  console.log('status:', result.status);
  console.log('specs type:', typeof result.specifications, Array.isArray(result.specifications));
  console.log('images type:', typeof result.images, Array.isArray(result.images));
  console.log('downloads type:', typeof result.downloads, Array.isArray(result.downloads));
  console.log('✓ getProduct SUCCESS');
} catch (e: any) {
  console.log('CRASH:', e.message);
  console.log('STACK:', e.stack?.split('\n').slice(0, 4).join('\n'));
}

await prisma.$disconnect();
await pool.end();
