import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getPublicHomepageSections(pageId?: string, preview?: boolean) {
  try {
    if (!process.env.DATABASE_URL) return [];
    const prisma = await getPrisma();
    const where: any = { enabled: true };
    if (pageId) where.pageId = pageId; else where.pageId = null;

    const sections = await prisma.homepageSection.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        versions: {
          where: { status: preview ? 'draft' : 'published' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Flatten: merge version data into section. Draft first, fallback to published.
    return sections.map(s => {
      const draft = s.versions.find((v: any) => v.status === 'draft') || s.versions[0];
      const v = (preview ? draft : s.versions.find((v: any) => v.status === 'published')) || s.versions[0] || draft;
      return { ...s, title: v?.title || null, subtitle: v?.subtitle || null, settings: v?.settings || {}, status: v?.status || 'draft', versions: undefined };
    });
  } catch {}
  return [];
}

export async function getLandingPages() {
  try {
    if (!process.env.DATABASE_URL) return [];
    const prisma = await getPrisma();
    return prisma.landingPage.findMany({ where: { published: true }, orderBy: { updatedAt: 'desc' } });
  } catch {}
  return [];
}
