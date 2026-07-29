import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Test with first EcoFlow product
  const p = await prisma.product.findFirst({ where: { slug: { startsWith: 'ecoflow-' } } });
  if (!p) { console.log("No EcoFlow product found"); process.exit(1); }
  
  console.log("Testing:", p.name, "| ID:", p.id);

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

    if (!product) { console.log("ERROR: findUnique returned null"); process.exit(1); }

    // Simulate what ProductForm does
    console.log("brand:", product.brand?.name || "NULL");
    console.log("categories:", product.categories.length);
    console.log("badgeRelations:", product.badgeRelations.length);
    console.log("specs:", Array.isArray(product.specifications) ? product.specifications.length : "NULL");
    console.log("images:", Array.isArray(product.images) ? product.images.length : "NULL");
    console.log("downloads:", Array.isArray(product.downloads) ? product.downloads.length : "NULL");
    
    // This is the getProduct mapping
    const result = {
      ...product,
      relations: product.relations.map((r: any) => ({
        id: r.id, productId: r.productId, relatedProductId: r.relatedProductId,
        type: r.type, relatedProduct: r.relatedProduct,
      })),
    };
    console.log("relations:", result.relations.length);
    
    // Simulate ProductForm line 47
    const defaultCatIds = result.categories?.map((pc: any) => pc.categoryId)
      || (result.categoryId ? [result.categoryId] : []);
    console.log("defaultCatIds:", defaultCatIds);
    
    console.log("\n✓ ALL CHECKS PASSED");
  } catch (e: any) {
    console.log("CRASH:", e.message);
    console.log("STACK:", e.stack?.split('\n').slice(0, 3).join('\n'));
  }

  await prisma.$disconnect();
  await pool.end();
}
main();
