import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getPublicHomepageSections() {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.homepageSection.findMany({
        where: { enabled: true, status: 'published' },
        orderBy: { sortOrder: 'asc' },
      });
      if (rows.length > 0) return rows;
    }
  } catch {}
  return [];
}
