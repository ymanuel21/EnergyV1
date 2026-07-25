const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CHILDREN = [
  // Panel Surya
  'monocrystalline:Monocrystalline:cat-panel-surya',
  'polycrystalline:Polycrystalline:cat-panel-surya',
  // Inverter
  'on-grid:On-Grid:cat-inverter',
  'off-grid:Off-Grid:cat-inverter',
  'hybrid:Hybrid:cat-inverter',
  'microinverter:Microinverter:cat-inverter',
  'single-phase:Single Phase:cat-inverter',
  'three-phase:Three Phase:cat-inverter',
  // Baterai
  'lithium-lifepo4:Lithium LiFePO4:cat-baterai',
  'rack-mounted:Rack Mounted:cat-baterai',
  'wall-mounted:Wall Mounted:cat-baterai',
  'all-in-one-ess:All-in-One (ESS):cat-baterai',
  // Solar Charge Controller
  'mppt:MPPT:cat-solar-charge-controller',
  'pwm:PWM:cat-solar-charge-controller',
  // Paket PLTS
  'paket-on-grid:On-Grid:cat-paket-plts',
  'paket-off-grid:Off-Grid:cat-paket-plts',
  'paket-hybrid:Hybrid:cat-paket-plts',
  'rumah:Rumah:cat-paket-plts',
  'kantor:Kantor:cat-paket-plts',
  'industri:Industri:cat-paket-plts',
  // Mounting & Rangka
  'atap-rooftop:Atap / Rooftop:cat-mounting-rangka',
  'ground-mounting:Ground Mounting:cat-mounting-rangka',
  'carport-canopy:Carport / Canopy:cat-mounting-rangka',
  // Kabel, Konektor & Proteksi
  'kabel-pv:Kabel PV:cat-kabel-konektor-proteksi',
  'konektor-mc4:Konektor MC4:cat-kabel-konektor-proteksi',
  'mcb-mccb-dc:MCB / MCCB DC:cat-kabel-konektor-proteksi',
  'spd-arrester:SPD / Arrester:cat-kabel-konektor-proteksi',
  'combiner-box:Combiner Box:cat-kabel-konektor-proteksi',
  // Pompa Air
  'submersible:Submersible:cat-pompa-air-tenaga-surya',
  'surface:Surface:cat-pompa-air-tenaga-surya',
];

async function main() {
  console.log('Inserting child categories...');
  let count = 0;
  for (const entry of CHILDREN) {
    const [slug, name, parentId] = entry.split(':');
    const id = `subcat-${slug}`;
    await prisma.category.upsert({
      where: { id },
      update: { name, parentId },
      create: { id, slug, name, parentId },
    });
    count++;
  }
  console.log(`Done: ${count} child categories inserted`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
