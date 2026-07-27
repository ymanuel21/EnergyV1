const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 5000 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PRODUCT_IMAGES = {
  'panel-surya-mitsubishi-mje275fb-275wp': ['/images/products/panel-surya-mitsubishi-275wp.svg'],
  'solar-panel-canadian-solar-hiku-440wp': ['/images/products/panel-surya-mitsubishi-275wp.svg'],
  'panel-surya-longi-hi-mo-5-540wp': ['/images/products/panel-surya-mitsubishi-275wp.svg'],
  'panel-surya-bekas-sisa-proyek-50-100wp': ['/images/products/panel-surya-mitsubishi-275wp.svg'],
  'baterai-lithium-pju-12-8v-60ah': ['/images/products/baterai-lithium-60ah.svg'],
  'baterai-lithium-power-wall-bezvolt-5120wh': ['/images/products/battery-wall-bezvolt.svg'],
  'bezvolt-hybrid-ongrid-inverter-6000w': ['/images/products/inverter-bezvolt-6000w.svg'],
  'bluetti-ac50p-portable-power-station': ['/images/products/power-station-bluetti.svg'],
};

const BANNER_IMAGES = {
  'banner-1': { image: '/images/banners/hero-energi-cerdas.svg', src: '/images/banners/hero-energi-cerdas.svg' },
  'banner-2': { image: '/images/banners/hero-afiliasi.svg', src: '/images/banners/hero-afiliasi.svg' },
};

async function main() {
  let count = 0;

  for (const [slug, images] of Object.entries(PRODUCT_IMAGES)) {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (product) {
      // Only update if currently using placeholder
      const current = product.images;
      if (current[0]?.includes('placeholder')) {
        await prisma.product.update({
          where: { slug },
          data: { images },
        });
        count++;
      }
    }
  }
  console.log(`Updated ${count} products`);

  let bannerCount = 0;
  for (const [id, data] of Object.entries(BANNER_IMAGES)) {
    try {
      await prisma.banner.update({ where: { id }, data });
      bannerCount++;
    } catch {}
  }
  console.log(`Updated ${bannerCount} banners`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
