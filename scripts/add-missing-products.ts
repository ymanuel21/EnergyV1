// Add 2 missing products from partial restore
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const brands = await prisma.brand.findMany({ select: { id: true, slug: true } });
  const cats = await prisma.category.findMany({ select: { id: true, slug: true, parentId: true } });
  const badges = await prisma.badge.findMany({ select: { id: true, slug: true } });

  const brandMap = new Map(brands.map(b => [b.slug, b.id]));
  const catMap = new Map(cats.filter(c => !c.parentId).map(c => [c.slug, c.id]));
  const badgeMap = new Map(badges.map(b => [b.slug, b.id]));

  const existing = await prisma.product.count();
  if (existing >= 8) { console.log('All 8 products already exist.'); await prisma.$disconnect(); await pool.end(); return; }

  const id7 = `p-restore-${Date.now().toString(36)}-7`;
  const p7 = await prisma.product.create({ data: {
    id: id7,
    name: "BEZVOLT Hybrid-OnGrid Inverter 6.000W (6 kW) Single Phase",
    slug: "bezvolt-hybrid-ongrid-inverter-6000w",
    description: "Inverter hybrid BEZVOLT 6kW — mendukung On-Grid dan Off-Grid dengan baterai.",
    price: 15900000, originalPrice: 17900000, stock: 2,
    sku: "BEZ-HYBRID-6000", model: "HY-6000-SP", weight: 18,
    condition: "new", warranty: "5 Tahun",
    images: ["/images/products/inverter-bezvolt-6000w.svg"],
    specifications: [{ label: "Daya Output", value: "6000W (6 kW)" }, { label: "Tipe", value: "Hybrid" }, { label: "MPPT", value: "2 input" }],
    downloads: [], badges: [],
    brandId: brandMap.get("bezvolt")!, categoryId: catMap.get("inverter")!,
    status: "draft", draftData: {}, isActive: false,
  }});
  await prisma.productCategory.create({ data: { productId: p7.id, categoryId: catMap.get("inverter")! }});
  await prisma.productBadge.create({ data: { productId: p7.id, badgeId: badgeMap.get("promo")! }});
  console.log("+ BEZVOLT Inverter 6kW");

  const id8 = `p-restore-${Date.now().toString(36)}-8`;
  const p8 = await prisma.product.create({ data: {
    id: id8,
    name: "BLUETTI AC50P Portable Power Station (504Wh / 700W)",
    slug: "bluetti-ac50p-portable-power-station",
    description: "Power station portabel BLUETTI — 504Wh, 700W AC output.",
    price: 6590000, originalPrice: 7300000, stock: 6,
    sku: "BLU-AC50P", model: "AC50P", weight: 6.8,
    condition: "new", warranty: "2 Tahun",
    images: ["/images/products/power-station-bluetti.svg"],
    specifications: [{ label: "Kapasitas", value: "504Wh" }, { label: "Output AC", value: "700W" }],
    downloads: [], badges: [],
    brandId: brandMap.get("bluetti")!, categoryId: catMap.get("baterai")!,
    status: "draft", draftData: {}, isActive: false,
  }});
  await prisma.productCategory.create({ data: { productId: p8.id, categoryId: catMap.get("baterai")! }});
  await prisma.productBadge.create({ data: { productId: p8.id, badgeId: badgeMap.get("promo")! }});
  console.log("+ BLUETTI AC50P");

  console.log("Done:", await prisma.product.count(), "products total");
  await prisma.$disconnect(); await pool.end();
}
main().catch(e => { console.error(e); process.exit(1); });
