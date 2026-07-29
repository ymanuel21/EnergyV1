// One-time migration: EcoFlow products from KV SUB-DEALER images
// Run: npx tsx scripts/migrate-ecoflow-products.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const SOURCE_DIR = '/Users/document/EnergyV1/KV SUB-DEALER';
const TARGET_DIR = path.join(process.cwd(), 'public/images/products/ecoflow');

interface ProductDef {
  folder: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  capacity: string;
  power: string;
  weight: string;
  category: 'power-station' | 'solar-panel';
  specs: { key: string; value: string }[];
  features: string[];
}

const PRODUCTS: ProductDef[] = [
  {
    folder: 'Solar panel Type C', name: 'EcoFlow 60W Portable Solar Panel (Type-C)',
    slug: 'ecoflow-60w-portable-solar-panel-type-c',
    description: 'EcoFlow 60W portable solar panel with universal Type-C connector. Foldable, compact design for direct charging on the go.',
    price: 0, capacity: '60W', power: '60W', weight: '',
    category: 'solar-panel',
    specs: [
      { key: 'Power Output', value: '60W' },
      { key: 'Connector', value: 'USB Type-C' },
      { key: 'Type', value: 'Portable Foldable' },
    ],
    features: ['Universal Connector', 'Foldable', 'Compact', 'Direct Charging via Type-C'],
  },
  {
    folder: 'Delta 3', name: 'EcoFlow DELTA 3 Portable Power Station (1024Wh)',
    slug: 'ecoflow-delta-3-1024wh',
    description: 'EcoFlow DELTA 3 with 1024Wh capacity, 1800W output. Charges 100% in 1 hour. 10+ year LiFePO4 battery lifetime. Lightweight at 12.5 kg.',
    price: 0, capacity: '1024Wh', power: '1800W', weight: '12.5 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '1024Wh (318,000mAh)' },
      { key: 'Output', value: '1800W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '12.5 kg' },
    ],
    features: ['Fastest Charging (100% in 1hr)', '10+ Year Lifetime', 'Lightweight', '4 Ways Charging'],
  },
  {
    folder: 'Delta 3 1500', name: 'EcoFlow DELTA 3 1500 Portable Power Station (1536Wh)',
    slug: 'ecoflow-delta-3-1500-1536wh',
    description: 'EcoFlow DELTA 3 1500 with 1536Wh capacity, 1800W output. 10+ year LiFePO4 battery. Weighs 16.5 kg.',
    price: 0, capacity: '1536Wh', power: '1800W', weight: '16.5 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '1536Wh (476,900mAh)' },
      { key: 'Output', value: '1800W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '16.5 kg' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', '4 Ways Charging'],
  },
  {
    folder: 'Delta 3 Plus', name: 'EcoFlow DELTA 3 Plus Portable Power Station (1024Wh)',
    slug: 'ecoflow-delta-3-plus-1024wh',
    description: 'EcoFlow DELTA 3 Plus with 1024Wh, 1800W output. Fastest charging — 100% in 1 hour. 12.5 kg.',
    price: 0, capacity: '1024Wh', power: '1800W', weight: '12.5 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '1024Wh (318,000mAh)' },
      { key: 'Output', value: '1800W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '12.5 kg' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', 'Lightweight', '4 Ways Charging'],
  },
  {
    folder: 'Delta 3 air 2000', name: 'EcoFlow DELTA 3 Air 2000 Portable Power Station (1920Wh)',
    slug: 'ecoflow-delta-3-air-2000-1920wh',
    description: 'EcoFlow DELTA 3 Air 2000 with 1920Wh, 1000W output. Ultralight at just 9.9 kg.',
    price: 0, capacity: '1920Wh', power: '1000W', weight: '9.9 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '1920Wh (596,000mAh)' },
      { key: 'Output', value: '1000W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '9.9 kg' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', 'Ultralight (9.9 kg)', '4 Ways Charging'],
  },
  {
    folder: 'Delta Pro 3', name: 'EcoFlow DELTA Pro 3 Portable Power Station (4096Wh)',
    slug: 'ecoflow-delta-pro-3-4096wh',
    description: 'EcoFlow DELTA Pro 3 — the flagship with 4096Wh, 4000W output. Award-winning design (2024). Professional-grade power.',
    price: 0, capacity: '4096Wh', power: '4000W', weight: '51.5 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '4096Wh (1,271,800mAh)' },
      { key: 'Output', value: '4000W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '51.5 kg' },
      { key: 'Award', value: 'EXCELLENCE AWARD 2024' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', '4000W Output', 'Award Winning Design', '4 Ways Charging'],
  },
  {
    folder: 'Lightweight', name: 'EcoFlow 160W Lightweight Solar Panel',
    slug: 'ecoflow-160w-lightweight-solar-panel',
    description: 'EcoFlow 160W lightweight portable solar panel. IP68 rated, foldable design. Universal compatibility.',
    price: 0, capacity: '160W', power: '160W', weight: '',
    category: 'solar-panel',
    specs: [
      { key: 'Power Output', value: '160W' },
      { key: 'Rating', value: 'IP68 Waterproof' },
      { key: 'Type', value: 'Portable Foldable' },
    ],
    features: ['160W Output', 'IP68 Waterproof', 'Foldable', 'Portable', 'Universal'],
  },
  {
    folder: 'River 3', name: 'EcoFlow RIVER 3 Portable Power Station (245Wh)',
    slug: 'ecoflow-river-3-245wh',
    description: 'EcoFlow RIVER 3 with 245Wh, 300W output. Ultralight at 3.5 kg. Award-winning design (2024).',
    price: 0, capacity: '245Wh', power: '300W', weight: '3.5 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '245Wh (76,000mAh)' },
      { key: 'Output', value: '300W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '3.5 kg' },
      { key: 'Award', value: 'EXCELLENCE AWARD 2024' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', 'Ultralight (3.5 kg)', 'Award Winning', '4 Ways Charging'],
  },
  {
    folder: 'River 3 max', name: 'EcoFlow RIVER 3 Max Portable Power Station (576Wh)',
    slug: 'ecoflow-river-3-max-576wh',
    description: 'EcoFlow RIVER 3 Max with 576Wh, 600W output. 8.2 kg. Award-winning design (2024).',
    price: 0, capacity: '576Wh', power: '600W', weight: '8.2 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '576Wh (178,800mAh)' },
      { key: 'Output', value: '600W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '8.2 kg' },
      { key: 'Award', value: 'EXCELLENCE AWARD 2024' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', 'Lightweight', 'Award Winning', '4 Ways Charging'],
  },
  {
    folder: 'River 3 max plus', name: 'EcoFlow RIVER 3 Max Plus Portable Power Station (858Wh)',
    slug: 'ecoflow-river-3-max-plus-858wh',
    description: 'EcoFlow RIVER 3 Max Plus with 858Wh, 600W output. 10.2 kg. Expanded capacity in RIVER form factor.',
    price: 0, capacity: '858Wh', power: '600W', weight: '10.2 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '858Wh (265,900mAh)' },
      { key: 'Output', value: '600W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '10.2 kg' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', '4 Ways Charging'],
  },
  {
    folder: 'River 3 plus', name: 'EcoFlow RIVER 3 Plus Portable Power Station (286Wh)',
    slug: 'ecoflow-river-3-plus-286wh',
    description: 'EcoFlow RIVER 3 Plus with 286Wh, 600W output. Compact at 4.7 kg. Award-winning (2024).',
    price: 0, capacity: '286Wh', power: '600W', weight: '4.7 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '286Wh (89,000mAh)' },
      { key: 'Output', value: '600W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '4.7 kg' },
      { key: 'Award', value: 'EXCELLENCE AWARD 2024' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', 'Award Winning', '4 Ways Charging'],
  },
  {
    folder: 'Trail 200 dc', name: 'EcoFlow TRAIL 200 DC Portable Power Station (192Wh)',
    slug: 'ecoflow-trail-200-dc-192wh',
    description: 'EcoFlow TRAIL 200 DC — ultraportable 192Wh, 220W output. LiFePO4 battery, only 1.8 kg. Perfect for trail and outdoor use.',
    price: 0, capacity: '192Wh', power: '220W', weight: '1.8 kg',
    category: 'power-station',
    specs: [
      { key: 'Capacity', value: '192Wh (60,000mAh)' },
      { key: 'Output', value: '220W' },
      { key: 'Charging', value: '100% in 1 hour' },
      { key: 'Battery', value: 'LiFePO4 — 10+ Year Lifetime' },
      { key: 'Weight', value: '1.8 kg' },
    ],
    features: ['Fastest Charging', '10+ Year Lifetime', 'Ultralight (1.8 kg)', 'LiFePO4 Battery'],
  },
];

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  console.log('=== EcoFlow Product Migration ===\n');

  // 1. Ensure EcoFlow brand exists
  let brand = await prisma.brand.findUnique({ where: { slug: 'ecoflow' } });
  if (!brand) {
    brand = await prisma.brand.create({
      data: { id: 'b-ecoflow', name: 'EcoFlow', slug: 'ecoflow', isActive: true },
    });
    console.log('Created brand: EcoFlow');
  } else {
    console.log('Brand exists: EcoFlow');
  }

  // 2. Ensure categories exist
  const catPowerStation = await prisma.category.upsert({
    where: { slug: 'portable-power-station' },
    create: { id: 'cat-power-station', name: 'Portable Power Station', slug: 'portable-power-station', isActive: true, sortOrder: 0 },
    update: {},
  });
  const catSolarPanel = await prisma.category.findUnique({ where: { slug: 'panel-surya' } });

  let created = 0, skipped = 0;

  // 3. Create products
  for (const def of PRODUCTS) {
    const exists = await prisma.product.findUnique({ where: { slug: def.slug } });
    if (exists) {
      console.log(`  SKIP  ${def.name} (already exists)`);
      skipped++;
      continue;
    }

    // Copy images
    const srcFolder = path.join(SOURCE_DIR, def.folder);
    if (fs.existsSync(srcFolder)) {
      const destFolder = path.join(TARGET_DIR, def.slug);
      fs.mkdirSync(destFolder, { recursive: true });
      const imgs = fs.readdirSync(srcFolder).filter(f => /\.png$/i.test(f));
      for (const img of imgs) {
        fs.copyFileSync(path.join(srcFolder, img), path.join(destFolder, img));
      }
    }

    const imagePaths = fs.existsSync(path.join(TARGET_DIR, def.slug))
      ? fs.readdirSync(path.join(TARGET_DIR, def.slug))
          .filter(f => /\.png$/i.test(f))
          .map(f => `/images/products/ecoflow/${def.slug}/${f}`)
      : [];

    await prisma.product.create({
      data: {
        id: `eco-${def.slug}`,
        name: def.name,
        slug: def.slug,
        description: def.description,
        price: def.price || 0,
        stock: 1,
        images: imagePaths,
        specifications: def.specs,
        downloads: [],
        badges: [],
        brandId: brand.id,
        categoryId: def.category === 'solar-panel' ? (catSolarPanel?.id || null) : catPowerStation.id,
        status: 'draft',
        draftData: {},
        isActive: false,
        weight: 0,
        condition: 'new',
        warranty: '5 Tahun',
      },
    });

    // Category relation
    const catId = def.category === 'solar-panel' ? (catSolarPanel?.id || catPowerStation.id) : catPowerStation.id;
    await prisma.productCategory.create({ data: { productId: `eco-${def.slug}`, categoryId: catId } });

    console.log(`  ✓  ${def.name} [${def.capacity} / ${def.power}]`);
    created++;
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Created: ${created}  Skipped: ${skipped}  Total: ${PRODUCTS.length}`);
  console.log(`All products created as DRAFT (status=draft, isActive=false)`);

  await prisma.$disconnect();
  await pool.end();
}
migrate().catch(e => { console.error(e); process.exit(1); });
