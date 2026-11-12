import 'server-only';
import { getPrisma } from '@/lib/db';
import { cache } from '@/lib/platform';
import { localizeRow, localizeRows, getLang } from '@/lib/i18n/server';

/** Phase 1: published homepage sections change only on publish (admin actions
 *  already call revalidatePath and now also cache.invalidate('sections')).
 *  Keyed by page + preview so a draft preview can never serve the published
 *  cache entry or vice-versa. Locale is part of the key for the same reason. */
const SECTIONS_TTL_SECONDS = 300;
export async function getPublicHomepageSections(pageId?: string, preview?: boolean) {
  const lang = await getLang();
  const key = `sections:${pageId ?? 'home'}:${preview ? 'draft' : 'published'}:${lang}`;
  // Preview is an admin-only path where freshness matters more than egress, so it
  // is never served from (or written to) the cache.
  const cached = preview ? undefined : cache.get<any[]>(key);
  if (cached) return cached;
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
    const flattened = sections.map(s => {      const draft = s.versions.find((v: any) => v.status === 'draft');
      const pub = s.versions.find((v: any) => v.status === 'published');
      const v = preview ? (draft || pub) : pub;
      const rawSettings = v?.settings;
      const settings = typeof rawSettings === 'string'
        ? (() => { try { return JSON.parse(rawSettings); } catch { return {}; } })()
        : (rawSettings || {});
      return { ...s, title: v?.title || null, subtitle: v?.subtitle || null, settings, status: v?.status || 'draft', versions: undefined };
    });
    // Localize first, then cache under a locale-scoped key.
    const localized = await localizeRows('homepage_sections', flattened);
    if (!preview) cache.set(key, localized, SECTIONS_TTL_SECONDS);
    return localized;  } catch {}
  return [];
}
export async function getLandingPages() {
  try {
    if (!process.env.DATABASE_URL) return [];
    const prisma = await getPrisma();
    // NOTE: `await` is required. Returning the Prisma promise directly
    // (`return prisma.landingPage.findMany()`) escapes this try/catch when the
    // driver adapter fails, turning a recoverable DB outage into a 500.
    const rows = await prisma.landingPage.findMany({ where: { published: true }, orderBy: { updatedAt: 'desc' } });
    return rows;
  } catch {}
  return [];
}
