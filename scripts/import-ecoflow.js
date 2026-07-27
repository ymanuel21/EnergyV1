const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const IMG_DIR = path.join(__dirname, '..', 'KV SUB-DEALER');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// Product definitions from folder names
const PRODUCTS = [
  // DELTA series — Portable Power Stations (Baterai → All-in-One ESS)
  {
    folder: 'Solar panel Type C',
    slug: 'ecoflow-solar-panel-type-c',
    name: 'EcoFlow Solar Panel Type C',
    brand: 'EcoFlow',
    category: 'cat-panel-surya',
    description: 'Panel surya portabel EcoFlow Type C — efisien dan ringan, kompatibel dengan power station EcoFlow DELTA dan RIVER.',
    price: 2500000,
    spec_label: 'Daya Maksimum',
    spec_value: '110W',
  },
  {
    folder: 'Delta 3',
    slug: 'ecoflow-delta-3',
    name: 'EcoFlow DELTA 3 Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow DELTA 3 — power station portabel dengan output AC murni, ideal untuk rumah tangga, camping, dan cadangan listrik.',
    price: 14999000,
    spec_label: 'Kapasitas',
    spec_value: '1024Wh',
  },
  {
    folder: 'Delta 3 1500',
    slug: 'ecoflow-delta-3-1500',
    name: 'EcoFlow DELTA 3 1500Wh Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow DELTA 3 1500 — power station portabel 1500Wh dengan teknologi X-Boost, mendukung pengisian cepat AC + solar.',
    price: 18999000,
    spec_label: 'Kapasitas',
    spec_value: '1536Wh',
  },
  {
    folder: 'Delta 3 Plus',
    slug: 'ecoflow-delta-3-plus',
    name: 'EcoFlow DELTA 3 Plus Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow DELTA 3 Plus — power station premium dengan kapasitas lebih besar dan fitur UPS untuk perlindungan perangkat elektronik.',
    price: 22999000,
    spec_label: 'Kapasitas',
    spec_value: '2048Wh',
  },
  {
    folder: 'Delta 3 air 2000',
    slug: 'ecoflow-delta-3-air-2000',
    name: 'EcoFlow DELTA 3 Air 2000Wh Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow DELTA 3 Air 2000 — ringan dan powerful, 2000Wh kapasitas dengan teknologi pengisian super cepat.',
    price: 25999000,
    spec_label: 'Kapasitas',
    spec_value: '2048Wh',
  },
  {
    folder: 'Delta Pro 3',
    slug: 'ecoflow-delta-pro-3',
    name: 'EcoFlow DELTA Pro 3 Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow DELTA Pro 3 — power station flagship dengan kapasitas ekspandabel, output 3600W, cocok untuk seluruh rumah.',
    price: 39999000,
    spec_label: 'Kapasitas',
    spec_value: '3600Wh (Expandable)',
    badges: ['promo', 'new'],
  },
  // RIVER series — Compact portable power stations
  {
    folder: 'River 3',
    slug: 'ecoflow-river-3',
    name: 'EcoFlow RIVER 3 Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow RIVER 3 — power station kompak dengan pengisian cepat, ideal untuk perjalanan dan kegiatan outdoor.',
    price: 4999000,
    spec_label: 'Kapasitas',
    spec_value: '256Wh',
  },
  {
    folder: 'River 3 max',
    slug: 'ecoflow-river-3-max',
    name: 'EcoFlow RIVER 3 Max Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow RIVER 3 Max — kapasitas lebih besar dalam ukuran kompak, output 600W untuk berbagai perangkat.',
    price: 7499000,
    spec_label: 'Kapasitas',
    spec_value: '512Wh',
  },
  {
    folder: 'River 3 max plus',
    slug: 'ecoflow-river-3-max-plus',
    name: 'EcoFlow RIVER 3 Max Plus Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow RIVER 3 Max Plus — kapasitas maksimal seri RIVER dengan port ekstra dan pengisian solar panel.',
    price: 8999000,
    spec_label: 'Kapasitas',
    spec_value: '768Wh',
  },
  {
    folder: 'River 3 plus',
    slug: 'ecoflow-river-3-plus',
    name: 'EcoFlow RIVER 3 Plus Portable Power Station',
    brand: 'EcoFlow',
    category: 'cat-baterai',
    subcategory: 'subcat-all-in-one-ess',
    description: 'EcoFlow RIVER 3 Plus — keseimbangan sempurna antara portabilitas dan kapasitas, sudah termasuk lampu LED.',
    price: 5999000,
    spec_label: 'Kapasitas',
    spec_value: '286Wh',
  },
  // Lightweight solar panel
  {
    folder: 'Lightweight',
    slug: 'ecoflow-lightweight-solar-panel',
    name: 'EcoFlow Lightweight Portable Solar Panel',
    brand: 'EcoFlow',
    category: 'cat-panel-surya',
    subcategory: 'subcat-flexible',
    description: 'Panel surya portabel EcoFlow Lightweight — desain ultra-ringan untuk dibawa kemana saja, kompatibel dengan semua power station EcoFlow.',
    price: 3800000,
    spec_label: 'Daya Maksimum',
    spec_value: '160W',
  },
  // Trail 200 DC — Accessories
  {
    folder: 'Trail 200 dc',
    slug: 'ecoflow-trail-200-dc',
    name: 'EcoFlow Trail 200 DC-DC Charger',
    brand: 'EcoFlow',
    category: 'cat-inverter',
    description: 'EcoFlow Trail 200 — DC-DC charger 200W untuk pengisian power station dari aki kendaraan saat perjalanan.',
    price: 1899000,
    spec_label: 'Output',
    spec_value: '200W DC',
  },
];

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Create EcoFlow brand
  let brand = await prisma.brand.findUnique({ where: { slug: 'ecoflow' } });
  if (!brand) {
    brand = await prisma.brand.create({
      data: {
        id: 'b-ecoflow',
        slug: 'ecoflow',
        name: 'EcoFlow',
        logo: '/images/brands/ecoflow.svg',
      },
    });
    console.log('Created EcoFlow brand');
  }

  let imported = 0;
  let imagesCopied = 0;
  const skipped = [];

  for (const def of PRODUCTS) {
    const folderPath = path.join(IMG_DIR, def.folder);
    if (!fs.existsSync(folderPath)) {
      console.log(`SKIP: folder not found: ${def.folder}`);
      skipped.push(def.folder);
      continue;
    }

    const files = fs.readdirSync(folderPath).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));
    if (files.length === 0) {
      skipped.push(def.folder);
      continue;
    }

    // Copy images to public/images/products/
    const imagePaths = [];
    for (const file of files) {
      const src = path.join(folderPath, file);
      const ext = path.extname(file);
      const destName = `${def.slug}-${file}`; 
      const dest = path.join(OUTPUT_DIR, destName);
      fs.copyFileSync(src, dest);
      imagePaths.push(`/images/products/${destName}`);
      imagesCopied++;
    }

    // Find or create subcategory
    let subcategoryId = null;
    if (def.subcategory) {
      const subcat = await prisma.category.findUnique({ where: { slug: def.subcategory } });
      if (subcat) subcategoryId = subcat.id;
    }

    // Upsert product
    const existing = await prisma.product.findUnique({ where: { slug: def.slug } });
    if (existing) {
      console.log(`SKIP: already exists: ${def.slug}`);
      // Still update images
      await prisma.product.update({
        where: { slug: def.slug },
        data: { images: imagePaths },
      });
      continue;
    }

    const product = await prisma.product.create({
      data: {
        id: `prod-${def.slug}`,
        slug: def.slug,
        name: def.name,
        description: def.description,
        price: def.price,
        stock: 10,
        sku: `EF-${def.slug.replace(/ecoflow-/, '').toUpperCase().replace(/-/g, '_')}`,
        condition: 'new',
        warranty: '2 Tahun',
        weight: 5,
        images: imagePaths,
        badges: def.badges || ['new'],
        specifications: [
          { label: def.spec_label, value: def.spec_value },
          { label: 'Brand', value: 'EcoFlow' },
        ],
        brandId: brand.id,
        categoryId: def.category,
        isActive: true,
        affiliateCommission: { percent: 2.5, amount: Math.round(def.price * 0.025) },
      },
    });

    // Link to subcategory via ProductCategory
    if (subcategoryId) {
      try {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId: subcategoryId },
        });
      } catch (e) { /* may already exist */ }
    }

    imported++;
    console.log(`IMPORTED: ${def.name} (${imagePaths.length} images)`);
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Products imported: ${imported}`);
  console.log(`Images copied: ${imagesCopied}`);
  if (skipped.length) console.log(`Skipped folders: ${skipped.join(', ')}`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
