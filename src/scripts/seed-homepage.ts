// Seed default homepage sections
// Run: npx tsx src/scripts/seed-homepage.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const existing = await prisma.homepageSection.count();
  if (existing > 0) {
    console.log(`${existing} sections exist — skipping seed`);
    await prisma.$disconnect();
    process.exit(0);
  }

  const sections = [
    {
      type: 'hero', sortOrder: 0, status: 'published',
      title: 'Tenaga surya', subtitle: 'untuk semua.',
      settings: { tagline: 'Energi Terbarukan', description: 'Produk berkualitas premium, dikurasi dengan cermat. Dari panel hingga sistem lengkap — kami membuat energi bersih menjadi sederhana.', cta: 'Jelajahi Katalog', ctaLink: '/produk', secondaryCta: 'Minta Penawaran →', secondaryLink: '/permintaan-penawaran' },
    },
    {
      type: 'category-grid', sortOrder: 1, status: 'published',
      title: 'Kategori', subtitle: 'Temukan yang Anda butuhkan',
      settings: {},
    },
    {
      type: 'featured-products', sortOrder: 2, status: 'published',
      title: 'Produk Unggulan', subtitle: '',
      settings: {},
    },
    {
      type: 'brands', sortOrder: 3, status: 'published',
      title: 'Brand Resmi', subtitle: '',
      settings: {},
    },
    {
      type: 'cta', sortOrder: 4, status: 'published',
      title: 'Butuh bantuan memilih?',
      subtitle: 'Tim kami siap membantu Anda menemukan produk yang tepat untuk kebutuhan energi Anda.',
      settings: { buttonLabel: 'Konsultasi Gratis', buttonLink: '/permintaan-penawaran' },
    },
  ];

  for (const s of sections) {
    await prisma.homepageSection.create({ data: s });
  }

  console.log(`Seeded ${sections.length} sections`);
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
