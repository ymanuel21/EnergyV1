// Simulate getProduct for EcoFlow products to find crash
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const products = await prisma.product.findMany({ where: { slug: { startsWith: 'ecoflow-' } }, select: { id: true, slug: true, name: true } });
  
  for (const p of products) {
    console.log(`\n=== ${p.name} (${p.slug}) ===`);
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
      
      if (!product) { console.log("  NULL product"); continue; }
      
      // Check all fields the ProductForm accesses
      const checks = [
        ['brand', product.brand],
        ['brand.name', product.brand?.name],
        ['categories', product.categories],
        ['categories.map', product.categories?.map],
        ['badgeRelations', product.badgeRelations],
        ['relations', product.relations],
        ['relations.map', product.relations?.map],
        ['specifications', product.specifications],
        ['images', product.images],
        ['downloads', product.downloads],
        ['draftData', product.draftData],
        ['description', product.description],
        ['price', product.price],
        ['originalPrice', product.originalPrice],
        ['stock', product.stock],
        ['sku', product.sku],
        ['condition', product.condition],
        ['warranty', product.warranty],
        ['weight', product.weight],
      ];
      
      for (const [label, val] of checks) {
        console.log(`  ${label.padEnd(22)} ${val === null ? 'NULL' : val === undefined ? 'UNDEFINED' : Array.isArray(val) ? `Array[${val.length}]` : typeof val}`);
      }

      // Simulate the getProduct mapping
      const result = {
        ...product,
        relations: product.relations.map((r: any) => ({
          id: r.id, productId: r.productId, relatedProductId: r.relatedProductId,
          type: r.type, relatedProduct: r.relatedProduct,
        })),
      };
      console.log("  result.relations    ", Array.isArray(result.relations) ? `Array[${result.relations.length}]` : typeof result.relations);
      
    } catch (e: any) {
      console.log(`  CRASH: ${e.message}`);
    }
  }
  
  await prisma.$disconnect();
  await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
