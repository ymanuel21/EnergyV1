// Seed default homepage sections with versions
// Idempotent — creates missing sections, updates existing
// Run: npx tsx src/scripts/seed-homepage.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const SECTION_DEFAULTS = [
  {
    type: 'hero', sortOrder: 0,
    title: 'Tenaga surya', subtitle: 'untuk semua.',
    settings: {
      tagline: 'Energi Terbarukan',
      description: 'Produk berkualitas premium, dikurasi dengan cermat. Dari panel hingga sistem lengkap — kami membuat energi bersih menjadi sederhana.',
      cta: 'Jelajahi Katalog', ctaLink: '/produk',
      secondaryCta: 'Minta Penawaran →', secondaryLink: '/permintaan-penawaran',
      height: 'medium', alignment: 'left', bgImage: '', overlayColor: '#000000', overlayOpacity: 0,
      showStats: false, showSearch: false, showCategories: false,
    },
  },
  {
    type: 'category-grid', sortOrder: 1,
    title: 'Kategori', subtitle: 'Temukan yang Anda butuhkan',
    settings: {},
  },
  {
    type: 'featured-products', sortOrder: 2,
    title: 'Produk Unggulan', subtitle: '',
    settings: {},
  },
  {
    type: 'brands', sortOrder: 3,
    title: 'Brand Resmi', subtitle: '',
    settings: {},
  },
  {
    type: 'cta', sortOrder: 4,
    title: 'Butuh bantuan memilih?',
    subtitle: 'Tim kami siap membantu Anda menemukan produk yang tepat untuk kebutuhan energi Anda.',
    settings: { buttonLabel: 'Konsultasi Gratis', buttonLink: '/permintaan-penawaran' },
  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  let created = 0;
  let published = 0;

  for (const def of SECTION_DEFAULTS) {
    // Find or create section
    let section = await prisma.homepageSection.findFirst({ where: { type: def.type } });

    if (!section) {
      section = await prisma.homepageSection.create({
        data: { type: def.type, sortOrder: def.sortOrder, enabled: false },
      });
      created++;
    }

    // Check if section already has a published version
    const existingPublished = await prisma.homepageSectionVersion.findFirst({
      where: { sectionId: section.id, status: 'published' },
    });

    if (existingPublished) {
      continue; // Already published — skip
    }

    // Check for existing draft
    const existingDraft = await prisma.homepageSectionVersion.findFirst({
      where: { sectionId: section.id, status: 'draft' },
    });

    if (existingDraft) {
      // Publish the existing draft
      await prisma.homepageSectionVersion.update({
        where: { id: existingDraft.id },
        data: { status: 'published', publishedAt: new Date() },
      });
    } else {
      // Create published version
      await prisma.homepageSectionVersion.create({
        data: {
          sectionId: section.id,
          status: 'published',
          title: def.title,
          subtitle: def.subtitle,
          settings: def.settings,
          publishedAt: new Date(),
        },
      });
    }

    // Enable the section
    await prisma.homepageSection.update({
      where: { id: section.id },
      data: { enabled: true },
    });

    published++;
  }

  console.log(`Created ${created} new sections, published ${published} sections (${SECTION_DEFAULTS.length} total)`);
  await prisma.$disconnect();
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
