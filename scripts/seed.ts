import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Static data imports
import { products } from '../src/lib/data/products';
import { categories } from '../src/lib/data/categories';
import { brands as brandData } from '../src/lib/data/brands';
import { articles } from '../src/lib/data/articles';
import { staticPages } from '../src/lib/data/static-pages';
import { SITE } from '../src/lib/constants';

const FAQ_DATA = [
  { q: 'Bagaimana cara membeli produk di EBTPlaza?', a: 'Pilih produk yang diinginkan, tambahkan ke keranjang, lalu lakukan checkout.' },
  { q: 'Apakah harga sudah termasuk PPN?', a: 'Harga yang tercantum belum termasuk PPN 11%.' },
  { q: 'Berapa lama pengiriman?', a: 'Pengiriman biasanya memakan waktu 2–7 hari kerja tergantung lokasi.' },
  { q: 'Apakah ada garansi?', a: 'Ya, setiap produk memiliki garansi yang berbeda-beda. Umumnya 2–12 tahun.' },
  { q: 'Apakah EBTPlaza menyediakan jasa instalasi?', a: 'Ya, kami menyediakan jasa instalasi untuk wilayah Jawa-Bali.' },
  { q: 'Bagaimana cara pembayaran?', a: 'Pembayaran melalui transfer bank (BCA, Mandiri, BRI).' },
  { q: 'Apakah bisa retur?', a: 'Retur dapat dilakukan dalam 7 hari setelah produk diterima.' },
  { q: 'Apakah ada diskon untuk pembelian dalam jumlah besar?', a: 'Ya, hubungi kami untuk penawaran khusus pembelian proyek.' },
];

const BANNER_DATA = [
  { type: 'hero', title: 'Header — Energi Terbarukan', src: '/images/placeholder/product-placeholder.png', alt: 'Header — EBTPlaza', link: '/produk' },
  { type: 'hero', title: 'Afiliasi', src: '/images/placeholder/product-placeholder.png', alt: 'Afiliasi — Dapatkan komisi', link: '/afiliasi' },
  { type: 'need-card', title: 'Beli Produk', image: '/images/placeholder/product-placeholder.png', label: 'Beli Produk', description: 'Sudah tahu produk yang dibutuhkan? Belanja langsung dari katalog.', link: '/produk' },
  { type: 'need-card', title: 'Pasang PLTS', image: '/images/placeholder/product-placeholder.png', label: 'Pasang PLTS', description: 'Solusi lengkap tenaga surya untuk rumah, kantor, atau toko.', link: '/kategori/paket-plts' },
  { type: 'need-card', title: 'Kebutuhan Proyek', image: '/images/placeholder/product-placeholder.png', label: 'Kebutuhan Proyek', description: 'Untuk kontraktor, perusahaan, & pengadaan skala besar.', link: '/permintaan-penawaran' },
];

async function main() {
  console.log('Seeding database...');

  const brandIds = brandData.map(b => b.id);
  const categoryIds = categories.map(c => c.id);
  const productIds = products.map(p => p.id);

  // Brands
  await prisma.brand.createMany({
    data: brandData.map(b => ({ id: b.id, slug: b.slug, name: b.name })),
    skipDuplicates: true,
  });
  console.log(`  ✓ brands: ${brandData.length}`);

  // Categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id, slug: cat.slug, name: cat.name, sortOrder: 0,
        parentId: cat.parentId ?? null,
      },
    });
    if (cat.children) {
      for (const child of cat.children) {
        await prisma.category.upsert({
          where: { id: child.id },
          update: {},
          create: { id: child.id, slug: child.slug, name: child.name, parentId: cat.id },
        });
      }
    }
  }
  console.log(`  ✓ categories: ${categories.length}`);

  // Products
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id, slug: p.slug, name: p.name, description: p.description,
        price: p.price, originalPrice: p.originalPrice, stock: p.stock,
        sku: p.sku, model: p.model, weight: p.weight, warranty: p.warranty,
        condition: p.condition, images: p.images as any, badges: p.badges as any,
 specifications: p.specifications as any,
 affiliateCommission: p.affiliateCommission as any,
        brandId: p.brandId, categoryId: p.categoryId, subcategoryId: p.subcategoryId ?? null,
      },
    });
  }
  console.log(`  ✓ products: ${products.length}`);

  // Articles
  await prisma.article.createMany({
    data: articles.map(a => ({
      slug: a.slug, title: a.title, excerpt: a.excerpt, content: a.content,
      category: a.category, author: a.author, readTime: a.readTime,
      isPublished: true, publishedAt: new Date(a.date),
    })),
    skipDuplicates: true,
  });
  console.log(`  ✓ articles: ${articles.length}`);

  // FAQs
  await prisma.faq.createMany({
    data: FAQ_DATA.map((f, i) => ({ question: f.q, answer: f.a, sortOrder: i })),
    skipDuplicates: true,
  });
  console.log(`  ✓ faqs: ${FAQ_DATA.length}`);

  // Static pages
  await prisma.staticPage.createMany({
    data: staticPages.map(p => ({ id: p.slug, slug: p.slug, title: p.title, content: p.content })),
    skipDuplicates: true,
  });
  console.log(`  ✓ pages: ${staticPages.length}`);

  // Settings
  const settings = [
    { key: 'name', value: 'EBTPlaza' },
    { key: 'tagline', value: 'Energi Terbarukan, Harga Terjangkau!' },
    { key: 'description', value: 'Pusat produk energi terbarukan EBTPlaza: panel surya, inverter, baterai lithium, paket PLTS, dan kebutuhan proyek.' },
    { key: 'email', value: 'info@energi.click' },
    { key: 'phone', value: '(022) 20522279' },
    { key: 'whatsapp', value: '6282112850215' },
    { key: 'address', value: 'Rekasurya EcoBuilding, Jl. Terusan Jakarta, Puri Dago Raya No.342 Kav 31, Sukamiskin, Kec. Arcamanik, Kota Bandung, Jawa Barat 40293' },
    { key: 'url', value: 'https://energ1.vercel.app' },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log(`  ✓ settings: ${settings.length}`);

  // Banners
  for (const b of BANNER_DATA) {
    await prisma.banner.create({
      data: {
        id: `banner-${b.type}-${BANNER_DATA.indexOf(b)}`,
        type: b.type, title: b.title, src: b.src, image: b.image,
        alt: b.alt, link: b.link, label: b.label, description: b.description,
      },
    });
  }
  console.log(`  ✓ banners: ${BANNER_DATA.length}`);

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
