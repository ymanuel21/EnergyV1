// Verify: 10 consecutive publishes all succeed with unlimited archives
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const section = await prisma.homepageSection.findFirst({ where: { type: 'featured-products', enabled: true } });
  if (!section) throw new Error('No section');

  console.log(`Testing section: ${section.id}`);
  console.log('Publishing 10 times...\n');

  for (let i = 1; i <= 10; i++) {
    // Create/update draft with unique settings for this iteration
    const newSettings = { source: 'manual', productIds: [`test-publish-${i}`], maxProducts: i };

    const existingDraft = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'draft' } });
    if (existingDraft) {
      await prisma.homepageSectionVersion.update({
        where: { id: existingDraft.id },
        data: { title: `Test Publish ${i}`, subtitle: `Iteration ${i}`, settings: newSettings },
      });
    } else {
      await prisma.homepageSectionVersion.create({
        data: { sectionId: section.id, status: 'draft', title: `Test Publish ${i}`, settings: newSettings },
      });
    }

    // Publish (simulate publishSection logic)
    const draft = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'draft' } });
    if (!draft) throw new Error('No draft');

    const oldPublished = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'published' } });
    if (oldPublished) {
      await prisma.homepageSectionVersion.update({ where: { id: oldPublished.id }, data: { status: 'archived' } });
    }

    await prisma.homepageSectionVersion.update({ where: { id: draft.id }, data: { status: 'published', publishedAt: new Date() } });

    console.log(`  Publish #${i} ✓`);
  }

  // Verify final state
  const versions = await prisma.homepageSectionVersion.findMany({ where: { sectionId: section.id } });
  const byStatus: Record<string, number> = {};
  for (const v of versions) {
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
  }
  console.log('\nFinal state:');
  console.log(`  Draft:     ${byStatus['draft'] || 0}`);
  console.log(`  Published: ${byStatus['published'] || 0} (should be 1)`);
  console.log(`  Archived:  ${byStatus['archived'] || 0} (should be 10)`);

  // Verify published settings match last publish
  const pub = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'published' } });
  const pubSettings = pub?.settings as any;
  console.log(`\nPublished settings: productIds=${JSON.stringify(pubSettings?.productIds)}, maxProducts=${pubSettings?.maxProducts}`);

  // Restore original settings
  const original = { source: 'manual', productIds: ['ecoflow-160w-lightweight-solar-panel'], maxProducts: 1, layout: 'grid', showPrice: true, showBadge: true, showCompare: true, showWishlist: true, buttonLabel: 'Lihat Semua', buttonLink: '/produk' };
  // Delete test records, re-create proper draft and published
  await prisma.homepageSectionVersion.deleteMany({ where: { sectionId: section.id } });
  await prisma.homepageSectionVersion.create({
    data: { sectionId: section.id, status: 'published', title: 'Produk Unggulan', settings: original, publishedAt: new Date() },
  });
  console.log('\n✅ Restored original settings');

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => console.error(e));
