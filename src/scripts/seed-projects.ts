// Seed projects and homepage section
// Run: npx tsx src/scripts/seed-projects.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // ── Projects ──
  const existingProjects = await prisma.project.findMany();
  if (existingProjects.length === 0) {
    console.log('Seeding 6 projects...');
    const projects = [
      { title:'PLTS Atap Residential 5 kWp — Villa Bandung', slug:'plts-atap-residential-5kwp-bandung', category:'residential', industry:'Residential', customer:'Bapak Hendra', location:'Bandung, Jawa Barat', capacity:'5 kWp', systemType:'On-Grid', pvModule:'LONGi Hi-MO 5 540 Wp × 10', inverter:'Growatt MIN 5000TL-X', year:2025, shortDescription:'Instalasi PLTS atap untuk rumah tinggal dengan sistem on-grid.', featured:true, published:true },
      { title:'PLTS Hybrid 15 kWp — Pabrik Garmen', slug:'plts-hybrid-15kwp-pabrik-garmen', category:'industrial', industry:'Textile', customer:'PT Sandang Makmur', location:'Cimahi, Jawa Barat', capacity:'15 kWp', systemType:'Hybrid', pvModule:'Canadian Solar HiKu 440 Wp × 34', inverter:'Sungrow SH15T', battery:'Dyness DL5.0C × 4', year:2025, shortDescription:'Sistem hybrid untuk pabrik garmen — mengurangi tagihan listrik 40%.', featured:true, published:true },
      { title:'PLTS Off-Grid 3 kWp — Sekolah Dasar Terpencil', slug:'plts-off-grid-3kwp-sekolah', category:'school', industry:'Education', customer:'SDN 3 Cijambe', location:'Sumedang, Jawa Barat', capacity:'3 kWp', systemType:'Off-Grid', pvModule:'JA Solar 450 Wp × 7', inverter:'Victron MultiPlus-II 3000VA', battery:'Dyness B3 × 2', year:2024, shortDescription:'Sekolah dasar di daerah tanpa listrik PLN kini memiliki akses listrik mandiri.', published:true },
      { title:'PLTS Atap Commercial 10 kWp — Ruko 3 Lantai', slug:'plts-atap-commercial-10kwp-ruko', category:'commercial', industry:'Retail', customer:'Toko Bangunan Jaya', location:'Jakarta Selatan', capacity:'10 kWp', systemType:'On-Grid', pvModule:'Jinko Tiger Neo 575 Wp × 18', inverter:'Huawei SUN2000-10KTL-M1', year:2025, shortDescription:'Ruko tiga lantai beralih ke tenaga surya — ROI dalam 5 tahun.', published:true },
      { title:'PLTS Ground-Mount 50 kWp — Peternakan Ayam', slug:'plts-ground-mount-50kwp-peternakan', category:'commercial', industry:'Agriculture', customer:'PT Agro Ternak Sejahtera', location:'Subang, Jawa Barat', capacity:'50 kWp', systemType:'On-Grid', pvModule:'Trina Vertex 670 Wp × 75', inverter:'Sungrow SG50CX', year:2025, shortDescription:'Peternakan ayam modern dengan PLTS ground-mount — hemat listrik 60%.', featured:true, published:true },
      { title:'PLTS Atap Government 20 kWp — Kantor Bupati', slug:'plts-atap-government-20kwp-kantor', category:'government', industry:'Government', customer:'Pemkab Garut', location:'Garut, Jawa Barat', capacity:'20 kWp', systemType:'On-Grid', pvModule:'LONGi Hi-MO 5 540 Wp × 37', inverter:'Huawei SUN2000-20KTL-M2', year:2024, shortDescription:'Kantor pemerintahan beralih ke energi bersih — mendukung target NZE 2060.', published:true },
    ];
    for (const p of projects) {
      await prisma.project.create({ data: { ...p, images:[], highlights:[], coverImage:'', productIds:[] } });
    }
    console.log(`Created ${projects.length} projects.`);
  } else {
    console.log(`${existingProjects.length} projects already exist — skipping.`);
  }

  // ── Homepage Section ──
  const existingSection = await prisma.homepageSection.findFirst({ where: { type:'projects' } });
  if (!existingSection) {
    const maxSort = await prisma.homepageSection.aggregate({ _max: { sortOrder:true } });
    const sortOrder = (maxSort._max.sortOrder || 0) + 1;
    const sec = await prisma.homepageSection.create({
      data: { type:'projects', enabled:true, sortOrder },
    });
    await prisma.homepageSectionVersion.create({
      data: { sectionId: sec.id, status:'published', title:'Proyek Referensi', subtitle:'Sudah dipercaya puluhan pelanggan di seluruh Indonesia', settings:{}, publishedAt: new Date() },
    });
    console.log('Created projects homepage section.');
  } else {
    const pub = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: existingSection.id, status: 'published' } });
    console.log(`Projects section already exists (${pub ? 'published' : 'draft'}).`);
  }

  // ── Verify ──
  const projCount = await prisma.project.count({ where: { published:true } });
  const secCount = await prisma.homepageSectionVersion.count({ where: { section: { type: 'projects', enabled: true }, status: 'published' } });
  console.log(`\nDone. Published projects: ${projCount}. Projects section: ${secCount}.`);

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
