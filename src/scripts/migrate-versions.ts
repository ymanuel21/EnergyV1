// Migrates existing HomepageSection data to HomepageSectionVersion
// Idempotent — safe to run multiple times
// Run: npx tsx src/scripts/migrate-versions.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Find sections that have no versions yet
  const sections = await prisma.homepageSection.findMany({
    where: { versions: { none: {} } },
    include: { versions: true },
  }) as any[];

  if (sections.length === 0) {
    console.log('All sections already have versions — nothing to migrate.');
    await pool.end();
    return;
  }

  console.log(`Migrating ${sections.length} sections without versions...`);

  for (const s of sections) {
    // The old schema had title/subtitle/settings/status directly on HomepageSection.
    // These fields still exist in the DB (prisma db push hasn't dropped them yet).
    await prisma.homepageSectionVersion.create({
      data: {
        sectionId: s.id,
        status: s.status || 'published',
        title: s.title || null,
        subtitle: s.subtitle || null,
        settings: (s.settings || {}) as any,
        publishedAt: s.status === 'published' ? s.updatedAt : null,
      },
    });
  }

  const count = await prisma.homepageSectionVersion.count();
  console.log(`Done. ${count} versions total across all sections.`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
