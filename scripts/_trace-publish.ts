// Test: does revision.create work outside transaction?
import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
  const prisma = await getAdminPrisma();
  
  try {
    // Simple create outside transaction
    const rev = await prisma.revision.create({
      data: {
        entityType: 'test',
        entityId: 'test-123',
        data: { foo: 'bar' },
      },
    });
    console.log('OK: revision created id=', rev.id.slice(-6));
    
    // Cleanup
    await prisma.revision.delete({ where: { id: rev.id } });
    console.log('OK: deleted');
  } catch (err: any) {
    console.log('FAIL:', err.message);
    console.log('Code:', err.code);
    if (err.meta) console.log('Meta:', JSON.stringify(err.meta));
  }

  // Now test inside transaction
  try {
    await prisma.$transaction(async (tx: any) => {
      const rev = await tx.revision.create({
        data: {
          entityType: 'test2',
          entityId: 'test-456',
          data: { bar: 'baz' },
        },
      });
      console.log('TX OK: revision created id=', rev.id.slice(-6));
    });
    console.log('TX COMMITTED');
    // Cleanup
    await prisma.revision.deleteMany({ where: { entityType: 'test2' } });
  } catch (err: any) {
    console.log('TX FAIL:', err.message);
    console.log('TX Code:', err.code);
    if (err.meta) console.log('TX Meta:', JSON.stringify(err.meta));
  }

  await prisma.$disconnect();
})();
