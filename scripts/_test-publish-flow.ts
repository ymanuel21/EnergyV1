// Simulate what happens when user clicks Publish in HomepageBuilder
// Tests the actual server action path: upsertSection → saveDraft → publishSection
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Get featured-products section
  const section = await prisma.homepageSection.findFirst({ where: { type: 'featured-products' } });
  if (!section) { console.log('No section'); return; }
  console.log('Section:', section.id);

  // Simulate the exact settings that would come from the HomepageBuilder form
  const formData = {
    id: section.id,
    type: 'featured-products',
    title: 'Produk Unggulan',
    subtitle: 'Test Publish',
    sortOrder: 3,
    // This is the settings JSON that the form would send
    settings: { source: 'manual', productIds: ['test-publish-slug'], maxProducts: 1, layout: 'grid', showPrice: true, showBadge: true },
  };

  // STEP 1: saveDraft (same as actions.ts line 105)
  console.log('\n1. Saving draft...');
  const existingDraft = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: formData.id, status: 'draft' } });
  if (existingDraft) {
    await prisma.homepageSectionVersion.update({
      where: { id: existingDraft.id },
      data: { title: formData.title, subtitle: formData.subtitle, settings: formData.settings as any },
    });
    console.log('   Updated existing draft:', existingDraft.id);
  } else {
    const newDraft = await prisma.homepageSectionVersion.create({
      data: { sectionId: formData.id, status: 'draft', title: formData.title, subtitle: formData.subtitle, settings: formData.settings as any },
    });
    console.log('   Created new draft:', newDraft.id);
  }

  // STEP 2: publishSection (same as actions.ts line 106)
  console.log('\n2. Publishing...');
  const draft = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: formData.id, status: 'draft' } });
  if (!draft) { console.log('   No draft found!'); return; }
  console.log('   Found draft:', draft.id, 'settings:', JSON.stringify(draft.settings).substring(0,50));

  // Archive old published
  const oldPublished = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: formData.id, status: 'published' } });
  if (oldPublished) {
    await prisma.homepageSectionVersion.update({ where: { id: oldPublished.id }, data: { status: 'archived' } });
    console.log('   Archived old published:', oldPublished.id);
  }

  // Promote draft to published
  await prisma.homepageSectionVersion.update({ where: { id: draft.id }, data: { status: 'published', publishedAt: new Date() } });

  // VERIFY
  console.log('\n3. Verification:');
  const versions = await prisma.homepageSectionVersion.findMany({ where: { sectionId: formData.id } });
  for (const v of versions) {
    const s = typeof v.settings === 'string' ? JSON.parse(v.settings as string) : v.settings;
    console.log(`   ${v.status}:`, JSON.stringify(s));
  }

  await prisma.$disconnect(); await pool.end();
}

main().catch(e => console.error(e));
