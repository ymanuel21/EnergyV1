import 'server-only';
import { getPrisma } from '@/lib/db';
import { cache } from '@/lib/platform';
import { localizeRow, localizeRows, getLang } from '@/lib/i18n/server';

/** Phase 1: navigation links change only when an admin edits them, so the public
 *  map is cached for 5 minutes instead of being queried on every request
 *  (Header, MobileMenu and Footer all read it). Keyed per locale. */
const NAV_TTL_SECONDS = 300;
const NAV_CACHE_KEY = 'nav:public';
export async function getPublicNavigationLinks(): Promise<Record<string, { label: string; href: string }[]>> {
  const lang = await getLang();
  const navKey = `${NAV_CACHE_KEY}:${lang}`;
  const cached = cache.get<Record<string, { label: string; href: string }[]>>(navKey);
  if (cached) return cached;
  try {
    const prisma = await getPrisma();
    const rawRows = await prisma.navigationLink.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
    });
    const rows = await localizeRows('navigation_links', rawRows);
    const map: Record<string, { label: string; href: string }[]> = {};
    for (const r of rows) {
      if (!map[r.group]) map[r.group] = [];
      map[r.group].push({ label: r.label, href: r.href });
    }
    // Only a successful read is cached — an error must not be memoised as "empty".
    cache.set(navKey, map, NAV_TTL_SECONDS);
    return map;
  } catch {}
  return {};
}
