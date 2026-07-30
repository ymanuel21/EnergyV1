// Master seed — restore entire CMS from empty DB
// Run: npx tsx prisma/seed/index.ts
// Idempotent — safe to run repeatedly (upsert-based)

async function main() {
  console.log('=== EBTPlaza CMS — Full Restore ===\n');

  // Phase 1–4: Foundation data
  console.log('1/5 Catalog...');
  require('./catalog');
  console.log('2/5 Homepage...');
  require('./homepage');
  console.log('3/5 Admin...');
  require('./admin');
  console.log('4/5 Projects...');
  require('./projects');

  // Phase 5: Navigation
  console.log('5/5 Navigation...');
  const { PrismaClient } = require('@prisma/client');
  const { PrismaPg } = require('@prisma/adapter-pg');
  const { Pool } = require('pg');
  require('dotenv/config');

  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const navCount = await prisma.navigationLink.count();
  if (navCount === 0) {
    const links = [
      // Header
      { label: 'Produk', slug: 'header-produk', group: 'header', url: '/produk', sortOrder: 1 },
      { label: 'Kategori', slug: 'header-kategori', group: 'header', url: '/kategori', sortOrder: 2 },
      { label: 'Brand', slug: 'header-brand', group: 'header', url: '/brand', sortOrder: 3 },
      { label: 'Proyek', slug: 'header-proyek', group: 'header', url: '/proyek', sortOrder: 4 },
      { label: 'Testimoni', slug: 'header-testimoni', group: 'header', url: '/testimoni', sortOrder: 5 },
      { label: 'Artikel', slug: 'header-artikel', group: 'header', url: '/artikel', sortOrder: 6 },
      // Footer Belanja
      { label: 'Semua Produk', slug: 'footer-belanja-0', group: 'footer_belanja', url: '/produk', sortOrder: 1 },
      { label: 'Brand', slug: 'footer-belanja-1', group: 'footer_belanja', url: '/brand', sortOrder: 2 },
      { label: 'Promo', slug: 'footer-belanja-2', group: 'footer_belanja', url: '/promo', sortOrder: 3 },
      { label: 'Produk Baru', slug: 'footer-belanja-3', group: 'footer_belanja', url: '/produk-baru', sortOrder: 4 },
      { label: 'Clearance', slug: 'footer-belanja-4', group: 'footer_belanja', url: '/barang-clearance', sortOrder: 5 },
      // Footer Layanan
      { label: 'Permintaan Penawaran', slug: 'footer-layanan-0', group: 'footer_layanan', url: '/permintaan-penawaran', sortOrder: 1 },
      { label: 'Program Afiliasi', slug: 'footer-layanan-1', group: 'footer_layanan', url: '/afiliasi', sortOrder: 2 },
      { label: 'Panduan Energi Surya', slug: 'footer-layanan-2', group: 'footer_layanan', url: '/artikel', sortOrder: 3 },
      { label: 'FAQ', slug: 'footer-layanan-3', group: 'footer_layanan', url: '/faq', sortOrder: 4 },
      { label: 'Tentang Kami', slug: 'footer-layanan-4', group: 'footer_layanan', url: '/halaman/tentang-kami', sortOrder: 5 },
      { label: 'Kebijakan Pengiriman', slug: 'footer-layanan-5', group: 'footer_layanan', url: '/halaman/kebijakan-pengiriman', sortOrder: 6 },
      { label: 'Kebijakan Retur', slug: 'footer-layanan-6', group: 'footer_layanan', url: '/halaman/kebijakan-retur', sortOrder: 7 },
      // Footer Legal
      { label: 'Syarat & Ketentuan', slug: 'footer-legal-0', group: 'footer_legal', url: '/halaman/syarat-ketentuan', sortOrder: 1 },
      { label: 'Kebijakan Privasi', slug: 'footer-legal-1', group: 'footer_legal', url: '/halaman/kebijakan-privasi', sortOrder: 2 },
      // Utility
      { label: 'Promo', slug: 'utility-promo', group: 'utility', url: '/promo', sortOrder: 1 },
      { label: 'Clearance', slug: 'utility-clearance', group: 'utility', url: '/barang-clearance', sortOrder: 2 },
      { label: 'Afiliator', slug: 'utility-afiliator', group: 'utility', url: '/afiliasi', sortOrder: 3 },
      { label: 'RFQ', slug: 'utility-rfq', group: 'utility', url: '/permintaan-penawaran', sortOrder: 4 },
      { label: 'Bantuan', slug: 'utility-bantuan', group: 'utility', url: '/faq', sortOrder: 5 },
      // Mobile
      { label: 'Produk', slug: 'mobile-produk', group: 'mobile', url: '/produk', sortOrder: 1 },
      { label: 'Kategori', slug: 'mobile-kategori', group: 'mobile', url: '/kategori', sortOrder: 2 },
      { label: 'Brand', slug: 'mobile-brand', group: 'mobile', url: '/brand', sortOrder: 3 },
      { label: 'Proyek', slug: 'mobile-proyek', group: 'mobile', url: '/proyek', sortOrder: 4 },
      { label: 'Testimoni', slug: 'mobile-testimoni', group: 'mobile', url: '/testimoni', sortOrder: 5 },
      { label: 'Artikel', slug: 'mobile-artikel', group: 'mobile', url: '/artikel', sortOrder: 6 },
      { label: 'Promo', slug: 'mobile-promo', group: 'mobile', url: '/promo', sortOrder: 7 },
      { label: 'Clearance', slug: 'mobile-clearance', group: 'mobile', url: '/barang-clearance', sortOrder: 8 },
      { label: 'Afiliator', slug: 'mobile-afiliator', group: 'mobile', url: '/afiliasi', sortOrder: 9 },
      { label: 'FAQ', slug: 'mobile-faq', group: 'mobile', url: '/faq', sortOrder: 10 },
    ];

    for (const link of links) {
      await prisma.navigationLink.upsert({
        where: { slug: link.slug },
        create: link,
        update: link,
      });
    }
    console.log(`  ✓ ${links.length} navigation links seeded`);
  } else {
    console.log(`  → ${navCount} links exist (skipped)`);
  }

  const [products, categories, brands, badges, projects, testimonials] = await Promise.all([
    prisma.product.count(), prisma.category.count(), prisma.brand.count(),
    prisma.badge.count(), prisma.project.count(), prisma.testimonial.count(),
  ]);

  console.log(`\n=== RESTORE COMPLETE ===`);
  console.log(`Products:     ${products}`);
  console.log(`Categories:   ${categories}`);
  console.log(`Brands:       ${brands}`);
  console.log(`Badges:       ${badges}`);
  console.log(`Projects:     ${projects}`);
  console.log(`Testimonials: ${testimonials}`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
