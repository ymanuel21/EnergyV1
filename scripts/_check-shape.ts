import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const ID = 'eco-ecoflow-river-3-max-plus-858wh';
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const p = await prisma.product.findUnique({
    where: { id: ID },
    include: { brand: true, categories: { include: { category: true } }, badgeRelations: { include: { badge: true } }, relations: { include: { relatedProduct: { select: { id: true, name: true, price: true, brand: { select: { name: true } } } } } } },
  });

  if (!p) { console.log('NOT FOUND'); return; }
  console.log('product:', p.name);
  console.log('brand:', p.brand?.name, '|', p.brand?.id);
  console.log('categories:', p.categories.length);
  console.log('badgeRelations:', p.badgeRelations.length);
  console.log('relations:', p.relations.length);

  // Check shapes
  console.log('\nJSON shapes:');
  const specs: any = p.specifications;
  console.log('specifications type:', typeof specs, Array.isArray(specs));
  if (Array.isArray(specs) && specs.length) {
    console.log('  spec[0] keys:', Object.keys(specs[0]).join(','));
    console.log('  spec[0]:', JSON.stringify(specs[0]));
  }

  const imgs: any = p.images;
  console.log('images type:', typeof imgs, Array.isArray(imgs));
  if (Array.isArray(imgs)) console.log('  images[0]:', imgs[0]);

  const dls: any = p.downloads;
  console.log('downloads type:', typeof dls, Array.isArray(dls));

  const bdg: any = p.badges;
  console.log('badges type:', typeof bdg, Array.isArray(bdg));
  if (Array.isArray(bdg) && bdg.length) console.log('  badges[0]:', typeof bdg[0], bdg[0]);

  const dd: any = p.draftData;
  console.log('draftData type:', typeof dd);

  const rels: any = p.relations;
  console.log('relations type:', typeof rels, Array.isArray(rels));
  if (Array.isArray(rels) && rels.length) {
    console.log('  rel[0] keys:', Object.keys(rels[0]).join(','));
    console.log('  rel[0].relatedProduct:', rels[0].relatedProduct ? 'exists' : 'null');
  }

  // Now simulate getProduct return
  try {
    const result = {
      ...p,
      relations: p.relations.map((r: any) => ({
        id: r.id, productId: r.productId, relatedProductId: r.relatedProductId,
        type: r.type, relatedProduct: r.relatedProduct,
      })),
    };
    console.log('\ngetProduct simulation: OK, relations count:', result.relations.length);

    // Simulate ProductForm state init
    const specs1 = result.specifications || [];
    console.log('specs state:', Array.isArray(specs1), specs1.length);

    const gallery = (() => {
      const raw = result.images;
      if (!raw || (Array.isArray(raw) && raw.length === 0)) return [];
      return Array.isArray(raw) ? raw : [];
    })();
    console.log('gallery state:', gallery.length);

    const downloads1 = result.downloads || [];
    console.log('downloads state:', Array.isArray(downloads1), downloads1.length);

    const defaultCatIds = result.categories?.map((pc: any) => pc.categoryId)
      || (result.categoryId ? [result.categoryId] : []);
    console.log('defaultCatIds:', defaultCatIds);

  } catch (e: any) {
    console.error('SIMULATION CRASH:', e.message);
    console.error(e.stack?.split('\n').slice(0, 4).join('\n'));
  }

  await prisma.$disconnect();
  await pool.end();
}
main();
