import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getThemeSettings(): Promise<Record<string, string>> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.siteSetting.findMany({
        where: { key: { startsWith: 'theme_' } },
      });
      const map: Record<string, string> = {};
      for (const r of rows) map[r.key] = r.value;
      return map;
    }
  } catch {}
  return {};
}
