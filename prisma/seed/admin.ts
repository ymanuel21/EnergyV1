// Permanent seed — default admin user
// Run: npx tsx prisma/seed/admin.ts
// Creates admin if none exists

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const email = process.env.ADMIN_EMAIL || 'admin@ebtplaza.com';
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (!existing) {
    await prisma.adminUser.create({
      data: { email, name: 'Admin', role: 'owner', permissions: '["manage_products","publish_content","manage_reviews"]' },
    });
    console.log(`Admin seed: created ${email} (owner)`);
  } else {
    console.log(`Admin seed: ${email} already exists (${existing.role})`);
  }

  await prisma.$disconnect(); await pool.end();
}
seed().catch(e => { console.error(e); process.exit(1); });
