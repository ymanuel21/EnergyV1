import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 10000 });

(async () => {
  const mapping: Record<string, string> = {
    'plts-atap-rumah-bandung-54-kwp': 'rooftop-residential.svg',
    'plts-ruko-surabaya-22-kwp': 'ruko-surabaya.svg',
    'plts-hybrid-kantor-jakarta-10-kwp': 'kantor-jakarta.svg',
    'plts-industri-tangerang-20-kwp': 'industrial-tangerang.svg',
    'plts-masjid-yogyakarta-4-kwp': 'masjid-yogya.svg',
    'plts-greenhouse-lembang-8-kwp': 'greenhouse-lembang.svg',
    'pju-tenaga-surya-garut-50-titik': 'pju-garut.svg',
    'plts-off-grid-pulau-seribu-32-kwp': 'island-offgrid.svg',
    'pompa-air-tenaga-surya-ntt': 'pompa-air-ntt.svg',
    'plts-klinik-papua-15-kwp': 'klinik-papua.svg',
  };
  for (const [slug, fn] of Object.entries(mapping)) {
    await pool.query(`UPDATE projects SET "coverImage"=$1 WHERE slug=$2`, [`/images/projects/${fn}`, slug]);
    console.log('✅', slug);
  }
  await pool.end();
  console.log('Done — 10 projects updated');
})();
