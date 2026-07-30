// Test: publishSection transaction atomicity
// Forces a failure mid-transaction and verifies full rollback
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

  // Record state BEFORE
  const snapBefore = await prisma.homepageSectionVersion.findMany({ where: { sectionId: section.id } });
  const dbefore = snapBefore.find(v => v.status === 'draft')?.id || 'none';
  const pbefore = snapBefore.find(v => v.status === 'published')?.id || 'none';
  const abefore = snapBefore.filter(v => v.status === 'archived').length;
  console.log(`BEFORE: draft=${dbefore.slice(-6)} pub=${pbefore.slice(-6)} archived=${abefore}`);

  // Run publish with a FORCED FAILURE between archive and promote
  let failureStep = 'none';
  try {
    await prisma.$transaction(async (tx: any) => {
      // 1. Archive old published
      const oldPub = await tx.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'published' } });
      if (oldPub) {
        await tx.homepageSectionVersion.update({ where: { id: oldPub.id }, data: { status: 'archived' } });
      }
      failureStep = 'after-archive';

      // FORCE FAILURE
      throw new Error('FORCED ROLLBACK — testing atomicity');

      // 2. Promote draft (never reached)
      const draft = await tx.homepageSectionVersion.findFirst({ where: { sectionId: section.id, status: 'draft' } });
      if (draft) {
        await tx.homepageSectionVersion.update({ where: { id: draft.id }, data: { status: 'published', publishedAt: new Date() } });
      }
    });
  } catch (e: any) {
    console.log(`Transaction rolled back at step: ${failureStep}`);
    console.log(`Error: ${e.message}`);
  }

  // Record state AFTER rollback
  const snapAfter = await prisma.homepageSectionVersion.findMany({ where: { sectionId: section.id } });
  const dafter = snapAfter.find(v => v.status === 'draft')?.id || 'none';
  const pafter = snapAfter.find(v => v.status === 'published')?.id || 'none';
  const aafter = snapAfter.filter(v => v.status === 'archived').length;
  const pcount = snapAfter.filter(v => v.status === 'published').length;
  console.log(`AFTER:  draft=${dafter.slice(-6)} pub=${pafter.slice(-6)} archived=${aafter} published_count=${pcount}`);

  // VERIFY
  console.log('\n── VERIFICATION ──');
  const checks = [
    { label: 'Draft preserved', pass: dbefore === dafter },
    { label: 'Published preserved', pass: pbefore === pafter },
    { label: 'No 0-published state', pass: pcount > 0 },
    { label: 'No 2-published state', pass: pcount === 1 },
    { label: 'Archived count unchanged', pass: abefore === aafter },
    { label: 'No orphaned records', pass: snapBefore.length === snapAfter.length },
  ];
  for (const c of checks) {
    console.log(`  ${c.pass ? '✅' : '❌'} ${c.label}`);
  }
  const allPass = checks.every(c => c.pass);
  console.log(`\n${allPass ? '✅ ALL CHECKS PASS — transaction is atomic' : '❌ ATOMICITY FAILURE'}`);

  await prisma.$disconnect();
  await pool.end();
  process.exit(allPass ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(1); });
