import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Test both: ecoflow-river-3-max-plus (failing) vs ecoflow-delta-3 (should work)
  for (const slug of ['ecoflow-river-3-max-plus-858wh', 'ecoflow-delta-3-1024wh']) {
    console.log(`\n=== ${slug} ===`);
    const p = await prisma.product.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } });
    if (!p) { console.log('  NOT FOUND'); continue; }

    try {
      const product = await prisma.product.findUnique({
        where: { id: p.id },
        include: {
          brand: true,
          categories: { include: { category: true } },
          badgeRelations: { include: { badge: true } },
          relations: { include: { relatedProduct: { select: { id: true, name: true, price: true, brand: { select: { name: true } } } } } },
        },
      });

      if (!product) { console.log('  PRODUCT NOT FOUND'); continue; }

      // Check every included relation
      console.log('  brand:', product.brand ? product.brand.name + ' (id:' + product.brand.id + ')' : 'NULL');
      console.log('  categories:', product.categories.length, product.categories.map(c => c.category?.name || 'NULL').join(','));
      console.log('  badgeRelations:', product.badgeRelations.length);
      console.log('  relations:', product.relations.length);
      console.log('  specs type:', Array.isArray(product.specifications), 'count:', (product.specifications as any)?.length);
      console.log('  images:', (product.images as any)?.length);
      console.log('  downloads:', (product.downloads as any)?.length);
      console.log('  status:', product.status);

      // Check for nulls in relations
      for (const c of product.categories) {
        if (!c.category) console.log('  NULL CATEGORY at relation!');
      }
      for (const br of product.badgeRelations) {
        if (!br.badge) console.log('  NULL BADGE at relation!');
      }
      for (const r of product.relations) {
        if (!r.relatedProduct) console.log('  NULL relatedProduct!');
      }

      // Simulate getProduct result
      const result = {
        ...product,
        relations: product.relations.map((r: any) => ({
          id: r.id, productId: r.productId, relatedProductId: r.relatedProductId,
          type: r.type, relatedProduct: r.relatedProduct,
        })),
      };
      console.log('  getProduct result: OK');

    } catch (e: any) {
      console.log('  CRASH:', e.message);
    }
  }

  await prisma.$disconnect();
  await pool.end();
}
main();
