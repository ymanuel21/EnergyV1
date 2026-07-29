import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getPublicHomepageSections(pageId?: string, preview?: boolean) {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const where: any = { enabled: true };
      if (!preview) where.status = 'published';
      if (pageId) where.pageId = pageId;
      else where.pageId = null;
      return prisma.homepageSection.findMany({ where, orderBy: { sortOrder: 'asc' } });
    }
  } catch {}
  return [];
}

export async function getLandingPages() {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      return prisma.landingPage.findMany({ where: { published: true }, orderBy: { updatedAt: 'desc' } });
    }
  } catch {}
  return [];
}
