import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getAllPages() {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.staticPage.findMany({ orderBy: { title: 'asc' } });
      if (rows.length > 0) return rows as any;
    }
  } catch (e) { console.error('Prisma getAllPages failed:', (e as Error).message); }
  return (await import('@/lib/data/static-pages')).staticPages;
}

export async function getPageBySlug(slug: string) {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const row = await prisma.staticPage.findUnique({ where: { slug } });
      if (row) return row as any;
    }
  } catch (e) { console.error('Prisma getPageBySlug failed:', (e as Error).message); }
  return (await import('@/lib/data/static-pages')).staticPages.find((p: any) => p.slug === slug);
}
