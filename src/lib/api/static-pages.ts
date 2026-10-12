import 'server-only';

import { applyEn, applyEnList } from '@/lib/i18n/apply-en';

export async function getAllPages() {
  try {
    if (process.env.DATABASE_URL) {
      const { getPrisma } = await import('@/lib/db');
      const prisma = await getPrisma();
      const rows = await prisma.staticPage.findMany({ orderBy: { title: 'asc' } });
      if (rows.length > 0) return applyEnList('pages', rows);
    }
  } catch (e) { console.error('Prisma getAllPages failed:', (e as Error).message); }
  return (await import('@/lib/data/static-pages')).staticPages;
}

export async function getPageBySlug(slug: string) {
  try {
    if (process.env.DATABASE_URL) {
      const { getPrisma } = await import('@/lib/db');
      const prisma = await getPrisma();
      const page = await prisma.staticPage.findUnique({ where: { slug } });
      if (page) return applyEn('pages', page);
    }
  } catch (e) { console.error('Prisma getPageBySlug failed:', (e as Error).message); }
  return (await import('@/lib/data/static-pages')).staticPages.find((p: any) => p.slug === slug);
}
