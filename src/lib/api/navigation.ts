import 'server-only';
import { getPrisma } from '@/lib/db';
import { applyEnList } from '@/lib/i18n/apply-en';

export async function getPublicNavigationLinks(): Promise<Record<string, { label: string; href: string }[]>> {
  try {
    const prisma = await getPrisma();
    const rawRows = await prisma.navigationLink.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
    });
    const rows = applyEnList('navigation_links', rawRows);
    const map: Record<string, { label: string; href: string }[]> = {};
    for (const r of rows) {
      if (!map[r.group]) map[r.group] = [];
      map[r.group].push({ label: r.label, href: r.href });
    }
    return map;
  } catch {}
  return {};
}
