import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getPublicNavigationLinks(): Promise<Record<string, { label: string; href: string }[]>> {
  try {
    const prisma = await getPrisma();
    const rows = await prisma.navigationLink.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
    });
    const map: Record<string, { label: string; href: string }[]> = {};
    for (const r of rows) {
      if (!map[r.group]) map[r.group] = [];
      map[r.group].push({ label: r.label, href: r.href });
    }
    return map;
  } catch {}
  return {};
}
