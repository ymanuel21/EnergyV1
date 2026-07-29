// Permanent seed — idempotent catalog restore
// Run: npx tsx prisma/seed/catalog.ts
// Safe to run any time — uses upsert, never deletes

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const BRANDS = [
  { slug: 'mitsubishi-electric', name: 'Mitsubishi Electric', logo: '/images/brands/mitsubishi-electric.svg' },
  { slug: 'canadian-solar', name: 'Canadian Solar', logo: '/images/brands/canadian-solar.svg' },
  { slug: 'longi', name: 'Longi', logo: '/images/brands/longi.svg' },
  { slug: 'bezvolt', name: 'Bezvolt', logo: '/images/brands/bezvolt.svg' },
  { slug: 'bluetti', name: 'Bluetti', logo: '/images/brands/bluetti.svg' },
  { slug: 'aiko', name: 'Aiko', logo: '/images/brands/aiko.svg' },
  { slug: 'sankelux', name: 'Sankelux', logo: '/images/brands/sankelux.svg' },
  { slug: 'gh-solar', name: 'GH Solar', logo: '/images/brands/gh-solar.svg' },
  { slug: 'srne', name: 'SRNE', logo: '/images/brands/srne.svg' },
  { slug: 'rekasurya', name: 'Rekasurya', logo: '/images/brands/rekasurya.svg' },
];

const CATEGORIES = [
  {
    slug: 'panel-surya', name: 'Panel Surya', children: [
      { slug: 'panel-surya-monocrystalline', name: 'Monocrystalline' },
      { slug: 'panel-surya-polycrystalline', name: 'Polycrystalline' },
    ],
  },
  {
    slug: 'inverter', name: 'Inverter', children: [
      { slug: 'inverter-on-grid', name: 'On-Grid' },
      { slug: 'inverter-off-grid', name: 'Off-Grid' },
      { slug: 'inverter-hybrid', name: 'Hybrid' },
      { slug: 'inverter-microinverter', name: 'Microinverter' },
      { slug: 'inverter-single-phase', name: 'Single Phase' },
      { slug: 'inverter-three-phase', name: 'Three Phase' },
    ],
  },
  {
    slug: 'baterai', name: 'Baterai', children: [
      { slug: 'baterai-lithium-lifepo4', name: 'Lithium LiFePO4' },
      { slug: 'baterai-rack-mounted', name: 'Rack Mounted' },
      { slug: 'baterai-wall-mounted', name: 'Wall Mounted' },
      { slug: 'baterai-all-in-one-ess', name: 'All-in-One (ESS)' },
    ],
  },
  { slug: 'solar-charge-controller', name: 'Solar Charge Controller', children: [
      { slug: 'solar-charge-controller-mppt', name: 'MPPT' },
      { slug: 'solar-charge-controller-pwm', name: 'PWM' },
  ]},
  { slug: 'paket-plts', name: 'Paket PLTS', children: [
      { slug: 'paket-plts-on-grid', name: 'On-Grid' },
      { slug: 'paket-plts-off-grid', name: 'Off-Grid' },
      { slug: 'paket-plts-hybrid', name: 'Hybrid' },
      { slug: 'paket-plts-rumah', name: 'Rumah' },
      { slug: 'paket-plts-kantor', name: 'Kantor' },
      { slug: 'paket-plts-industri', name: 'Industri' },
  ]},
  { slug: 'mounting-rangka', name: 'Mounting & Rangka', children: [
      { slug: 'mounting-rangka-atap-rooftop', name: 'Atap / Rooftop' },
      { slug: 'mounting-rangka-ground-mounting', name: 'Ground Mounting' },
      { slug: 'mounting-rangka-carport-canopy', name: 'Carport / Canopy' },
  ]},
  { slug: 'kabel-konektor-proteksi', name: 'Kabel, Konektor & Proteksi', children: [
      { slug: 'kabel-konektor-proteksi-kabel-pv', name: 'Kabel PV' },
      { slug: 'kabel-konektor-proteksi-konektor-mc4', name: 'Konektor MC4' },
      { slug: 'kabel-konektor-proteksi-mcb-mccb', name: 'MCB / MCCB DC' },
      { slug: 'kabel-konektor-proteksi-spd-arrester', name: 'SPD / Arrester' },
      { slug: 'kabel-konektor-proteksi-combiner-box', name: 'Combiner Box' },
  ]},
  { slug: 'pompa-air-tenaga-surya', name: 'Pompa Air Tenaga Surya', children: [
      { slug: 'pompa-air-tenaga-surya-submersible', name: 'Submersible' },
      { slug: 'pompa-air-tenaga-surya-surface', name: 'Surface' },
  ]},
  { slug: 'brand', name: 'Brand' },
];

const BADGES = [
  { slug: 'clearance', name: 'Clearance', color: '#DC2626', bgColor: '#FEF2F2' },
  { slug: 'promo', name: 'Promo', color: '#2563EB', bgColor: '#EFF6FF' },
  { slug: 'cheapest', name: 'Cheapest', color: '#D97706', bgColor: '#FFFBEB' },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  let b = 0, c = 0, bg = 0;
  const ts = Date.now().toString(36);
  const genId = (prefix: string, n: number) => `${prefix}-${ts}-${n}`;

  // Brands — upsert by slug
  for (const def of BRANDS) {
    await prisma.brand.upsert({
      where: { slug: def.slug },
      create: { id: genId('b', b), name: def.name, slug: def.slug, logo: def.logo, isActive: true },
      update: { name: def.name, logo: def.logo },
    });
    b++;
  }

  // Categories — upsert roots by slug, children by parent-prefixed slug
  for (const cat of CATEGORIES) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      create: { id: genId('cat', c), name: cat.name, slug: cat.slug, isActive: true, sortOrder: 0 },
      update: { name: cat.name },
    });
    c++;
    if (cat.children) {
      for (const child of cat.children) {
        await prisma.category.upsert({
          where: { slug: child.slug },
          create: { id: genId('sub', c), name: child.name, slug: child.slug, parentId: parent.id, isActive: true, sortOrder: 0 },
          update: { name: child.name, parentId: parent.id },
        });
        c++;
      }
    }
  }

  // Badges — upsert by slug
  for (const def of BADGES) {
    await prisma.badge.upsert({
      where: { slug: def.slug },
      create: { id: genId('bg', bg), slug: def.slug, name: def.name, color: def.color, bgColor: def.bgColor, isActive: true, sortOrder: 0 },
      update: { name: def.name, color: def.color, bgColor: def.bgColor },
    });
    bg++;
  }

  console.log(`Catalog seed: ${b} brands, ${c} categories, ${bg} badges`);
  await prisma.$disconnect(); await pool.end();
}
seed().catch(e => { console.error(e); process.exit(1); });
