// Permanent seed — homepage sections with published versions
// Run: npx tsx prisma/seed/homepage.ts
// Idempotent — upserts by section type, creates versions if missing

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const SECTIONS = [
  {
    type: 'hero', sortOrder: 0,
    title: 'Tenaga surya', subtitle: 'untuk semua.',
    settings: {
      tagline: 'Energi Terbarukan',
      description: 'Produk berkualitas premium, dikurasi dengan cermat.',
      cta: 'Jelajahi Katalog', ctaLink: '/produk',
      secondaryCta: 'Minta Penawaran →', secondaryLink: '/permintaan-penawaran',
      height: 'medium', alignment: 'left', bgImage: '',
      overlayColor: '#000000', overlayOpacity: 0,
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
    subtitle: 'Tim kami siap membantu.',
    settings: { buttonLabel: 'Konsultasi Gratis', buttonLink: '/permintaan-penawaran' },
  },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  let created = 0, published = 0;

  for (const def of SECTIONS) {
    let section = await prisma.homepageSection.findFirst({ where: { type: def.type } });
    if (!section) {
      section = await prisma.homepageSection.create({
        data: { type: def.type, sortOrder: def.sortOrder, enabled: false },
      });
      created++;
    }

    const hasPublished = await prisma.homepageSectionVersion.findFirst({
      where: { sectionId: section.id, status: 'published' },
    });

    if (!hasPublished) {
      const draft = await prisma.homepageSectionVersion.findFirst({
        where: { sectionId: section.id, status: 'draft' },
      });

      if (draft) {
        await prisma.homepageSectionVersion.update({
          where: { id: draft.id },
          data: { status: 'published', publishedAt: new Date() },
        });
      } else {
        await prisma.homepageSectionVersion.create({
          data: {
            sectionId: section.id, status: 'published',
            title: def.title, subtitle: def.subtitle,
            settings: def.settings, publishedAt: new Date(),
          },
        });
      }
      published++;
    }

    await prisma.homepageSection.update({
      where: { id: section.id },
      data: { enabled: true },
    });
  }

  console.log(`Homepage seed: ${created} new sections, ${published} published`);
  await prisma.$disconnect(); await pool.end();
}
seed().catch(e => { console.error(e); process.exit(1); });
