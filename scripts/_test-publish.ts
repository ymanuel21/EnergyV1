// Test publish flow — trace where settings get lost
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Get featured-products section
  const section = await prisma.homepageSection.findFirst({ where: { type: 'featured-products', enabled: true } });
  if (!section) { console.log('No section found'); return; }
  console.log('Section:', section.id, section.type);

  // Get all versions
  const versions = await prisma.homepageSectionVersion.findMany({ where: { sectionId: section.id } });
  for (const v of versions) {
    const settings = typeof v.settings === 'string' ? JSON.parse(v.settings as string) : v.settings;
    console.log(`  ${v.status}:`, JSON.stringify(settings));
  }

  // TEST: manually write settings to draft and publish
  const testSettings = { source: 'manual', productIds: ['test-slug'], maxProducts: 1 };

  // Write draft
  const existingDraft = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'draft' } });
  if (existingDraft) {
    await prisma.homepageSectionVersion.update({
      where: { id: existingDraft.id },
      data: { title: 'Produk Unggulan', subtitle: 'Test', settings: testSettings as any },
    });
    console.log('Updated draft with:', JSON.stringify(testSettings));
  }
  
  // Now publish
  const draft = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'draft' } });
  console.log('Draft after update:', draft?.id, JSON.stringify(draft?.settings));

  // Archive old published
  const oldPublished = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'published' } });
  if (oldPublished) {
    await prisma.homepageSectionVersion.update({ where: { id: oldPublished.id }, data: { status: 'archived' } });
    console.log('Archived old published:', oldPublished.id);
  }

  // Promote draft to published
  if (draft) {
    await prisma.homepageSectionVersion.update({ where: { id: draft.id }, data: { status: 'published', publishedAt: new Date() } });
    console.log('Promoted draft to published');
  }

  // Verify
  const published = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'published' } });
  console.log('\nPublished AFTER:', JSON.stringify(published?.settings));

  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => console.error(e));
