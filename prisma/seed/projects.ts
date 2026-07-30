// Permanent seed: demo projects
// Run: npx tsx prisma/seed/projects.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const PROJECTS = [
  {
    title: 'PLTS Atap Rumah Bandung 5.4 kWp',
    slug: 'plts-atap-rumah-bandung-54-kwp',
    shortDescription: 'Instalasi panel surya atap untuk rumah tinggal di Bandung dengan sistem on-grid. Tagihan listrik turun 80%.',
    category: 'residential', industry: 'Perumahan',
    location: 'Bandung, Jawa Barat', customer: 'Bapak Hendra — Rumah Tinggal', year: 2025,
    capacity: '5.4 kWp', systemType: 'On-Grid',
    pvModule: 'LONGi Hi-MO 5 540 Wp Bifacial', inverter: 'BEZVOLT Inverter 6kW', battery: '',
    highlights: ['Tagihan listrik turun 80%', 'ROI dalam 6 tahun', '10 panel bifacial', 'Monitoring real-time'],
    productSlugs: ['panel-surya-longi-hi-mo-5-540wp', 'bezvolt-hybrid-ongrid-inverter-6000w'],
    coverImage: '/images/projects/rooftop-residential.png', images: [],
    story: { challenge: 'Tagihan listrik mencapai Rp2.5 juta/bulan.', solution: '10 panel LONGi 540 Wp dengan inverter BEZVOLT 6kW on-grid.', result: 'Produksi 22 kWh/hari. Tagihan turun menjadi Rp400-500 ribu/bulan.' },
    impact: { co2Reduction: 4200, annualSavings: 24000000, energyGenerated: '8,030 kWh/tahun' },
    seo: { title: 'PLTS Atap Rumah Bandung 5.4 kWp — Hemat 80%', description: 'Instalasi panel surya atap Bandung. LONGi 540 Wp.' },
    featured: true,
  },
  {
    title: 'PLTS Off-Grid Pulau Seribu 3.2 kWp',
    slug: 'plts-off-grid-pulau-seribu-32-kwp',
    shortDescription: 'Sistem off-grid mandiri untuk resort kecil di Pulau Seribu. Bebas dari genset, listrik 24 jam.',
    category: 'commercial', industry: 'Pariwisata',
    location: 'Pulau Seribu, DKI Jakarta', customer: 'Resort Bahari — Pulau Pari', year: 2025,
    capacity: '3.2 kWp', systemType: 'Off-Grid',
    pvModule: 'Canadian Solar HiKu 440 Wp', inverter: 'BEZVOLT Inverter 6kW', battery: 'BEZVOLT Power Wall 5.12 kWh',
    highlights: ['Bebas genset', 'Listrik 24 jam', 'Penghematan solar Rp60 juta/tahun', 'Ramah lingkungan'],
    productSlugs: ['solar-panel-canadian-solar-hiku-440wp', 'bezvolt-hybrid-ongrid-inverter-6000w', 'baterai-lithium-power-wall-bezvolt-5120wh'],
    coverImage: '/images/projects/island-offgrid.png', images: [],
    story: { challenge: 'Resort hanya mengandalkan genset 10 jam/hari. Biaya solar Rp5 juta/bulan.', solution: '8 panel Canadian Solar 440 Wp + inverter + baterai LiFePO4 5.12 kWh off-grid.', result: 'Listrik 24 jam. Biaya operasional turun drastis.' },
    impact: { co2Reduction: 3500, annualSavings: 60000000, energyGenerated: '4,800 kWh/tahun' },
    seo: { title: 'PLTS Off-Grid Pulau Seribu 3.2 kWp', description: 'Sistem off-grid resort Pulau Seribu. Canadian Solar 440 Wp.' },
    featured: true,
  },
  {
    title: 'PLTS Industri Tangerang 20 kWp',
    slug: 'plts-industri-tangerang-20-kwp',
    shortDescription: 'Sistem hybrid untuk pabrik garmen. Tagihan listrik turun 60%.',
    category: 'industrial', industry: 'Manufaktur',
    location: 'Tangerang, Banten', customer: 'PT Garmen Nusantara', year: 2024,
    capacity: '20 kWp', systemType: 'Hybrid',
    pvModule: 'Mitsubishi 275 Wp Mono', inverter: 'BEZVOLT Inverter 6kW', battery: 'Baterai Lithium 12.8V 60Ah',
    highlights: ['Tagihan turun 60%', '47 panel', 'Hybrid dengan backup', 'CO₂ -15 ton/tahun'],
    productSlugs: ['panel-surya-mitsubishi-mje275fb-275wp', 'bezvolt-hybrid-ongrid-inverter-6000w', 'baterai-lithium-pju-12-8v-60ah'],
    coverImage: '/images/projects/industrial-tangerang.png', images: [],
    story: { challenge: 'Pabrik konsumsi 8,000 kWh/bulan. Tagihan Rp12 juta/bulan.', solution: '47 panel Mitsubishi 275 Wp hybrid dengan baterai backup.', result: 'Tagihan turun menjadi Rp5 juta. Penghematan Rp84 juta/tahun.' },
    impact: { co2Reduction: 15000, annualSavings: 84000000, energyGenerated: '30,000 kWh/tahun' },
    seo: { title: 'PLTS Industri Tangerang 20 kWp', description: 'Sistem hybrid pabrik garmen. Mitsubishi 275 Wp.' },
    featured: false,
  },
  {
    title: 'PLTS Ruko Surabaya 2.2 kWp',
    slug: 'plts-ruko-surabaya-22-kwp',
    shortDescription: 'PLTS atap untuk ruko 3 lantai. Cocok untuk bisnis kecil yang ingin hemat listrik.',
    category: 'commercial', industry: 'Ritel',
    location: 'Surabaya, Jawa Timur', customer: 'Toko Elektronik Cahaya', year: 2025,
    capacity: '2.2 kWp', systemType: 'On-Grid',
    pvModule: 'LONGi Hi-MO 5 540 Wp', inverter: 'BEZVOLT Inverter 6kW', battery: '',
    highlights: ['Tagihan turun 50%', '4 panel LONGi', 'Ideal bisnis kecil', 'Instalasi 3 hari'],
    productSlugs: ['panel-surya-longi-hi-mo-5-540wp', 'bezvolt-hybrid-ongrid-inverter-6000w'],
    coverImage: '/images/projects/ruko-surabaya.png', images: [],
    story: { challenge: 'Ruko tagihan Rp1.8 juta/bulan.', solution: '4 panel LONGi 540 Wp on-grid.', result: 'Tagihan turun 50%. ROI 4 tahun.' },
    impact: { co2Reduction: 1700, annualSavings: 10800000, energyGenerated: '2,920 kWh/tahun' },
    seo: { title: 'PLTS Ruko Surabaya 2.2 kWp', description: 'PLTS atap ruko Surabaya. LONGi 540 Wp.' },
    featured: false,
  },
  {
    title: 'PLTS Greenhouse Lembang 8 kWp',
    slug: 'plts-greenhouse-lembang-8-kwp',
    shortDescription: 'Sistem PLTS untuk greenhouse sayuran. Pompa, lampu grow, irigasi bertenaga surya.',
    category: 'agriculture', industry: 'Pertanian',
    location: 'Lembang, Jawa Barat', customer: 'Greenhouse Hidroponik Sehat', year: 2025,
    capacity: '8 kWp', systemType: 'Hybrid',
    pvModule: 'Canadian Solar HiKu 440 Wp', inverter: 'BEZVOLT Inverter 6kW', battery: 'BEZVOLT Power Wall 5.12 kWh',
    highlights: ['Pompa bertenaga surya', 'Lampu grow LED', 'Monitoring otomatis', 'Produksi naik 30%'],
    productSlugs: ['solar-panel-canadian-solar-hiku-440wp', 'bezvolt-hybrid-ongrid-inverter-6000w', 'baterai-lithium-power-wall-bezvolt-5120wh'],
    coverImage: '/images/projects/greenhouse-lembang.png', images: [],
    story: { challenge: 'Greenhouse butuh listrik 24 jam. Tagihan Rp4 juta/bulan.', solution: '18 panel Canadian Solar + baterai hybrid.', result: 'Produksi naik 30%. Tagihan turun 70%.' },
    impact: { co2Reduction: 6200, annualSavings: 33600000, energyGenerated: '11,680 kWh/tahun' },
    seo: { title: 'PLTS Greenhouse Lembang 8 kWp', description: 'Sistem hybrid greenhouse. Canadian Solar 440 Wp.' },
    featured: true,
  },
  {
    title: 'PJU Tenaga Surya Garut — 50 Titik',
    slug: 'pju-tenaga-surya-garut-50-titik',
    shortDescription: '50 titik lampu jalan tenaga surya di Kabupaten Garut. Hemat APBD, desa lebih terang.',
    category: 'infrastructure', industry: 'Pemerintahan',
    location: 'Garut, Jawa Barat', customer: 'Pemkab Garut', year: 2024,
    capacity: '5 kWp', systemType: 'Off-Grid',
    pvModule: 'Panel Surya Bekas 50-100 Wp', inverter: '', battery: 'Baterai Lithium 12.8V 60Ah',
    highlights: ['50 titik lampu', 'Tanpa tagihan listrik', 'Desa lebih terang', 'Hemat APBD Rp200 juta'],
    productSlugs: ['panel-surya-bekas-sisa-proyek-50-100wp', 'baterai-lithium-pju-12-8v-60ah'],
    coverImage: '/images/projects/pju-garut.png', images: [],
    story: { challenge: '50 lampu jalan padam, kabel dicuri.', solution: 'PJU tenaga surya mandiri per tiang.', result: 'Desa terang. Angka kriminalitas turun.' },
    impact: { co2Reduction: 2800, annualSavings: 200000000, energyGenerated: '5,000 kWh/tahun' },
    seo: { title: 'PJU Tenaga Surya Garut — 50 Titik', description: 'Lampu jalan tenaga surya Kabupaten Garut.' },
    featured: false,
  },
  {
    title: 'Pompa Air Tenaga Surya NTT',
    slug: 'pompa-air-tenaga-surya-ntt',
    shortDescription: 'Pompa air tenaga surya untuk irigasi sawah di NTT. Petani panen 3 kali setahun.',
    category: 'agriculture', industry: 'Pertanian',
    location: 'Kupang, NTT', customer: 'Kelompok Tani Maju Bersama', year: 2025,
    capacity: '2 kWp', systemType: 'Off-Grid',
    pvModule: 'Mitsubishi 275 Wp Mono', inverter: '', battery: 'Baterai Lithium 12.8V 60Ah',
    highlights: ['Pompa tanpa BBM', 'Panen 3x setahun', 'Irigasi 5 hektar', 'Swadaya masyarakat'],
    productSlugs: ['panel-surya-mitsubishi-mje275fb-275wp', 'baterai-lithium-pju-12-8v-60ah'],
    coverImage: '/images/projects/pompa-air-ntt.png', images: [],
    story: { challenge: 'Petani hanya panen 1x/tahun, mengandalkan hujan.', solution: 'Pompa air tenaga surya off-grid.', result: 'Panen 3x/tahun. Pendapatan naik signifikan.' },
    impact: { co2Reduction: 1100, annualSavings: 45000000, energyGenerated: '3,200 kWh/tahun' },
    seo: { title: 'Pompa Air Tenaga Surya NTT', description: 'Pompa air surya irigasi NTT. Mitsubishi 275 Wp.' },
    featured: false,
  },
  {
    title: 'PLTS Hybrid Kantor Jakarta 10 kWp',
    slug: 'plts-hybrid-kantor-jakarta-10-kwp',
    shortDescription: 'Sistem hybrid untuk gedung perkantoran. Beban kritis tetap menyala saat padam.',
    category: 'commercial', industry: 'Perkantoran',
    location: 'Jakarta Selatan', customer: 'PT Teknologi Nusantara', year: 2024,
    capacity: '10 kWp', systemType: 'Hybrid',
    pvModule: 'LONGi Hi-MO 5 540 Wp', inverter: 'BEZVOLT Inverter 6kW', battery: 'BEZVOLT Power Wall 5.12 kWh',
    highlights: ['Beban kritis tetap on', '19 panel LONGi', 'Penghematan Rp30 juta', 'Green loan'],
    productSlugs: ['panel-surya-longi-hi-mo-5-540wp', 'bezvolt-hybrid-ongrid-inverter-6000w', 'baterai-lithium-power-wall-bezvolt-5120wh'],
    coverImage: '/images/projects/kantor-jakarta.png', images: [],
    story: { challenge: 'Kantor sering pemadaman, server butuh backup.', solution: '19 panel LONGi + baterai hybrid.', result: 'Bebas pemadaman. Tagihan turun 40%.' },
    impact: { co2Reduction: 7800, annualSavings: 30000000, energyGenerated: '14,600 kWh/tahun' },
    seo: { title: 'PLTS Hybrid Kantor Jakarta 10 kWp', description: 'Sistem hybrid kantor Jakarta. LONGi 540 Wp.' },
    featured: false,
  },
  {
    title: 'PLTS Masjid Yogyakarta 4 kWp',
    slug: 'plts-masjid-yogyakarta-4-kwp',
    shortDescription: 'Panel surya untuk masjid. Mengurangi biaya listrik agar dana lebih banyak untuk sosial.',
    category: 'social', industry: 'Sosial',
    location: 'Sleman, Yogyakarta', customer: 'Masjid Al-Hidayah', year: 2025,
    capacity: '4 kWp', systemType: 'On-Grid',
    pvModule: 'Canadian Solar HiKu 440 Wp', inverter: 'BEZVOLT Inverter 6kW', battery: '',
    highlights: ['Tagihan turun 70%', 'Dana sosial naik', 'Inisiatif hijau', 'Komunitas terlibat'],
    productSlugs: ['solar-panel-canadian-solar-hiku-440wp', 'bezvolt-hybrid-ongrid-inverter-6000w'],
    coverImage: '/images/projects/masjid-yogya.png', images: [],
    story: { challenge: 'Masjid tagihan Rp1.5 juta/bulan.', solution: '9 panel Canadian Solar on-grid.', result: 'Tagihan turun 70%. Dana dialihkan ke sosial.' },
    impact: { co2Reduction: 3100, annualSavings: 12600000, energyGenerated: '5,840 kWh/tahun' },
    seo: { title: 'PLTS Masjid Yogyakarta 4 kWp', description: 'Panel surya masjid Yogyakarta. Canadian Solar 440 Wp.' },
    featured: false,
  },
  {
    title: 'PLTS Klinik Papua 1.5 kWp',
    slug: 'plts-klinik-papua-15-kwp',
    shortDescription: 'Sistem off-grid untuk klinik di pedalaman Papua. Vaksin tetap tersimpan aman.',
    category: 'social', industry: 'Kesehatan',
    location: 'Wamena, Papua', customer: 'Klinik Harapan', year: 2024,
    capacity: '1.5 kWp', systemType: 'Off-Grid',
    pvModule: 'Mitsubishi 275 Wp Mono', inverter: '', battery: 'BEZVOLT Power Wall 5.12 kWh',
    highlights: ['Vaksin aman', 'Listrik 24 jam', 'Panel bekas — hemat', 'Layan 5 desa'],
    productSlugs: ['panel-surya-mitsubishi-mje275fb-275wp', 'baterai-lithium-power-wall-bezvolt-5120wh'],
    coverImage: '/images/projects/klinik-papua.png', images: [],
    story: { challenge: 'Klinik tanpa listrik PLN. Vaksin rusak tanpa pendingin.', solution: '5 panel Mitsubishi + baterai off-grid.', result: 'Vaksin aman. Klinik melayani 5 desa.' },
    impact: { co2Reduction: 800, annualSavings: 36000000, energyGenerated: '2,190 kWh/tahun' },
    seo: { title: 'PLTS Klinik Papua 1.5 kWp', description: 'Sistem off-grid klinik Papua. Mitsubishi 275 Wp.' },
    featured: true,
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  let created = 0, updated = 0;
  for (const p of PROJECTS) {
    const products = await prisma.product.findMany({
      where: { slug: { in: p.productSlugs } },
      select: { id: true, slug: true },
    });
    const productIds = products.map(pr => pr.id);

    const existing = await prisma.project.findUnique({ where: { slug: p.slug } });

    await prisma.project.upsert({
      where: { slug: p.slug },
      create: {
        title: p.title, slug: p.slug, shortDescription: p.shortDescription,
        category: p.category, industry: p.industry, location: p.location,
        customer: p.customer, year: p.year, capacity: p.capacity,
        systemType: p.systemType, pvModule: p.pvModule, inverter: p.inverter,
        battery: p.battery, highlights: p.highlights, coverImage: p.coverImage,
        images: p.images, productIds,
        storyData: p.story, impactData: p.impact, seoData: p.seo,
        featured: p.featured, published: true,
      },
      update: {
        title: p.title, shortDescription: p.shortDescription,
        category: p.category, industry: p.industry, location: p.location,
        customer: p.customer, year: p.year, capacity: p.capacity,
        systemType: p.systemType, pvModule: p.pvModule, inverter: p.inverter,
        battery: p.battery, highlights: p.highlights, coverImage: p.coverImage,
        images: p.images, productIds,
        storyData: p.story, impactData: p.impact, seoData: p.seo,
        featured: p.featured, published: true,
      },
    });

    existing ? updated++ : created++;
    console.log(`  ${existing ? '↻' : '✓'} ${p.title} (${products.length} products linked)`);
  }

  console.log(`\n${created} new, ${updated} updated, ${created + updated} total`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
