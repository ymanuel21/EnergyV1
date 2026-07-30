// Test actual Prisma publishSection
import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const prisma = await getAdminPrisma();
  
  // Find section
  const section = await prisma.homepageSection.findFirst({ where: { type: 'featured-products', enabled: true } });
  console.log('Section:', section?.id?.slice(-6));
  
  // Find draft
  const draft = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section?.id, status: 'draft' } });
  const pub = await prisma.homepageSectionVersion.findFirst({ where: { sectionId: section?.id, status: 'published' } });
  console.log('Draft:', draft?.id?.slice(-6), draft?.title);
  console.log('Published:', pub?.id?.slice(-6), pub?.title);

  // Test: can we create a revision via Prisma?
  try {
    const rev = await prisma.revision.create({
      data: {
        entityType: 'homepage_section',
        entityId: draft!.id,
        data: { test: true },
        userId: '',
        userName: '',
      },
    });
    console.log('Revision created:', rev.id.slice(-6));
    
    // Delete test revision
    await prisma.revision.delete({ where: { id: rev.id } });
    console.log('Revision deleted');
  } catch (err: any) {
    console.log('Revision create FAILED:', err.message);
  }

  // Now run the full publish in a transaction
  if (draft && pub) {
    try {
      await prisma.$transaction(async (tx: any) => {
        // Archive old published
        const rev = await tx.revision.create({
          data: {
            entityType: 'homepage_section',
            entityId: pub.id,
            data: { title: pub.title, subtitle: pub.subtitle, settings: pub.settings, publishedAt: pub.publishedAt },
            userId: '',
            userName: '',
          },
        });
        console.log('  [tx] revision:', rev.id.slice(-6));
        
        await tx.homepageSectionVersion.update({ where: { id: pub.id }, data: { status: 'archived' } });
        console.log('  [tx] archived old published');
        
        await tx.homepageSectionVersion.update({ where: { id: draft.id }, data: { status: 'published', publishedAt: new Date() } });
        console.log('  [tx] promoted draft');
      });
      console.log('TRANSACTION COMMITTED');
    } catch (err: any) {
      console.log('TRANSACTION FAILED:', err.message);
    }
  }

  // Verify
  const after = await prisma.homepageSectionVersion.findMany({ where: { sectionId: section?.id }, orderBy: { createdAt: 'asc' } });
  console.log('\nAFTER:');
  after.forEach(v => console.log(`  ${v.status}: ${v.id.slice(-6)} "${v.title}"`));

  await prisma.$disconnect();
})();
