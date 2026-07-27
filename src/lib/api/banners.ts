import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getPublicBanners() {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
      if (rows.length > 0) return rows;
    }
  } catch {}
  return [];
}
