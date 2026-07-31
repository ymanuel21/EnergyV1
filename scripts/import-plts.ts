// Import PLTS package products — verified info only
import { Pool } from 'pg';
import { readFileSync, copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { createHash } from 'crypto';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

interface PLTSProduct {
  slug: string;
  name: string;
  powerW: number;
  phase: string;
  filename: string;
}

const products: PLTSProduct[] = [
  { slug: 'plts-2000w-1-phase', name: 'PLTS 2000W 1 Phase', powerW: 2000, phase: '1 Phase', filename: '2000.jpg' },
  { slug: 'plts-3000w-1-phase', name: 'PLTS 3000W 1 Phase', powerW: 3000, phase: '1 Phase', filename: '3000.jpg' },
  { slug: 'plts-4000w-1-phase', name: 'PLTS 4000W 1 Phase', powerW: 4000, phase: '1 Phase', filename: '4000.jpg' },
  { slug: 'plts-5000w-1-phase', name: 'PLTS 5000W 1 Phase', powerW: 5000, phase: '1 Phase', filename: '5000 1PHASE.jpg' },
  { slug: 'plts-5000w-3-phase', name: 'PLTS 5000W 3 Phase', powerW: 5000, phase: '3 Phase', filename: '5000 3PHASE.jpg' },
  { slug: 'plts-6000w-1-phase', name: 'PLTS 6000W 1 Phase', powerW: 6000, phase: '1 Phase', filename: '6000 1PHASE.jpg' },
  { slug: 'plts-6000w-3-phase', name: 'PLTS 6000W 3 Phase', powerW: 6000, phase: '3 Phase', filename: '6000 3PHASE.jpg' },
  { slug: 'plts-7000w-1-phase', name: 'PLTS 7000W 1 Phase', powerW: 7000, phase: '1 Phase', filename: '7000 1PHASE.jpg' },
  { slug: 'plts-7000w-3-phase', name: 'PLTS 7000W 3 Phase', powerW: 7000, phase: '3 Phase', filename: '7000 3PHASE.jpg' },
  { slug: 'plts-8000w-1-phase', name: 'PLTS 8000W 1 Phase', powerW: 8000, phase: '1 Phase', filename: '8000 1PHASE.jpg' },
  { slug: 'plts-8000w-3-phase', name: 'PLTS 8000W 3 Phase', powerW: 8000, phase: '3 Phase', filename: '8000 3PHASE.jpg' },
  { slug: 'plts-9000w-1-phase', name: 'PLTS 9000W 1 Phase', powerW: 9000, phase: '1 Phase', filename: '9000 1PHASE.jpg' },
  { slug: 'plts-9000w-3-phase', name: 'PLTS 9000W 3 Phase', powerW: 9000, phase: '3 Phase', filename: '9000 3PHASE.jpg' },
  { slug: 'plts-10000w-1-phase', name: 'PLTS 10000W 1 Phase', powerW: 10000, phase: '1 Phase', filename: '10.000 1PHASE.jpg' },
  { slug: 'plts-10000w-3-phase', name: 'PLTS 10000W 3 Phase', powerW: 10000, phase: '3 Phase', filename: '10.000 3PHASE.jpg' },
];

const sourceDir = '/Users/document/EnergyV1/PLTS';
const targetDir = '/Users/document/EnergyV1/public/images/products/plts';
if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

async function importProducts() {
  // Get or create "Paket PLTS" category
  let cat = await pool.query("SELECT id FROM categories WHERE slug = $1", ['paket-plts']);
  if (cat.rows.length === 0) {
    console.log('Creating paket-plts category...');
    cat = await pool.query(
      "INSERT INTO categories (id, slug, name, sort_order) VALUES ($1, $2, $3, 0) RETURNING id",
      [randomUUID(), 'paket-plts', 'Paket PLTS']
    );
  }
  const categoryId = cat.rows[0].id;
  console.log('Category ID:', categoryId);

  // Use existing "EBTPlaza" or generic brand if exists, otherwise skip brand
  let brandId: string | null = null;
  const brand = await pool.query("SELECT id FROM brands WHERE slug = $1 LIMIT 1", ['ebtplaza']);
  if (brand.rows.length === 0) {
    // Create a generic PLTS brand
    const newBrand = await pool.query(
      "INSERT INTO brands (id, slug, name, is_active) VALUES ($1, $2, $3, true) RETURNING id",
      [randomUUID(), 'ebtplaza', 'EBTPlaza']
    );
    brandId = newBrand.rows[0].id;
  } else {
    brandId = brand.rows[0].id;
  }
  console.log('Brand ID:', brandId);

  for (const prod of products) {
    // Check if already exists
    const existing = await pool.query("SELECT id FROM products WHERE slug = $1", [prod.slug]);
    if (existing.rows.length > 0) {
      console.log(`SKIP: ${prod.slug} (exists)`);
      continue;
    }

    // Copy image
    const sourceImg = join(sourceDir, prod.filename);
    const ext = prod.filename.split('.').pop();
    const targetImgName = `${prod.slug}.${ext}`;
    const targetImg = join(targetDir, targetImgName);
    copyFileSync(sourceImg, targetImg);
    const imagePath = `/images/products/plts/${targetImgName}`;
    console.log(`COPIED: ${prod.filename} → ${targetImg}`);

    // Generate description from verified info
    const description = `**PLTS ${prod.powerW}W ${prod.phase}** — Paket Pembangkit Listrik Tenaga Surya.

Sistem tenaga surya lengkap dengan daya ${prod.powerW}W untuk kebutuhan ${prod.phase.toLowerCase().includes('1') ? 'rumah tangga' : 'komersial/industri'}.

Komponen sistem dapat disesuaikan berdasarkan kebutuhan proyek. Konfigurasi final akan ditentukan saat konsultasi.

Tersedia layanan konsultasi gratis untuk menentukan spesifikasi yang tepat.`;

    const specifications = JSON.stringify([
      { key: 'Daya Sistem', value: `${prod.powerW}W`, source: 'Filename' },
      { key: 'Fase', value: prod.phase, source: 'Filename' },
      { key: 'Jenis', value: 'Paket PLTS (On-Grid / Off-Grid / Hybrid)', source: 'Project default' },
      { key: 'Panel Surya', value: 'Konfigurasi kustom tersedia', source: 'Project default' },
      { key: 'Inverter', value: 'Konfigurasi kustom tersedia', source: 'Project default' },
      { key: 'Baterai', value: 'Opsional — konfigurasi kustom', source: 'Project default' },
      { key: 'Mounting System', value: 'Termasuk dalam paket', source: 'Project default' },
      { key: 'Proteksi', value: 'Termasuk DC MCB/MCCB, SPD, Combiner Box', source: 'Project default' },
      { key: 'Kabel PV', value: 'Termasuk dalam paket', source: 'Project default' },
      { key: 'Garansi', value: 'Hubungi kami untuk detail', source: 'Project default' },
      { key: 'Sertifikasi', value: 'Hubungi kami untuk detail', source: 'Project default' },
    ]);

    const id = randomUUID();
    await pool.query(
      `INSERT INTO products (id, slug, name, description, price, stock, images, specifications, 
       brand_id, category_id, is_active, status, condition, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())`,
      [
        id,
        prod.slug,
        prod.name,
        description,
        0, // price: contact for quote
        999, // stock
        JSON.stringify([imagePath]),
        specifications,
        brandId,
        categoryId,
        true, // is_active
        'published',
        'new',
      ]
    );
    console.log(`IMPORTED: ${prod.slug}`);
  }

  const count = await pool.query("SELECT COUNT(*) FROM products WHERE slug LIKE 'plts-%'");
  console.log(`\nTotal PLTS products: ${count.rows[0].count}`);
  await pool.end();
}

importProducts().catch(console.error);
