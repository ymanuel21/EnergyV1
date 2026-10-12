import 'server-only';
import { getPrisma } from '@/lib/db';
import { applyEnList } from '@/lib/i18n/apply-en';

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
          where: preview
            ? { status: { in: ['draft', 'published'] } }
            : { status: 'published' },
          orderBy: { createdAt: 'desc' },
          take: preview ? 2 : 1,
        },
      },
    });

    // Flatten: prefer draft in preview mode, else published
    const flattened = sections.map(s => {
      const draft = s.versions.find((v: any) => v.status === 'draft');
      const pub = s.versions.find((v: any) => v.status === 'published');
      const v = preview ? (draft || pub) : pub;
      const rawSettings = v?.settings;
      const settings = typeof rawSettings === 'string'
        ? (() => { try { return JSON.parse(rawSettings); } catch { return {}; } })()
        : (rawSettings || {});
      return { ...s, title: v?.title || null, subtitle: v?.subtitle || null, settings, status: v?.status || 'draft', versions: undefined };
    });
    // English overlay, keyed by section id. Object-valued patches (settings) merge onto the
    // existing settings object, so image paths, anchor ids and accent colours are preserved.
    return applyEnList('homepage_sections', flattened);
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
