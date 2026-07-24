import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getAllCategories(): Promise<any[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.category.findMany({ where: { isActive: true }, include: { children: true }, orderBy: { sortOrder: 'asc' } });
      if (rows.length > 0) return rows;
    }
  } catch (e) { console.error('Prisma getAllCategories failed:', (e as Error).message); }
  return (await import('@/lib/data/categories')).categories as any[];
}

export async function getCategoryBySlug(slug: string): Promise<any> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const row = await prisma.category.findUnique({ where: { slug }, include: { children: true, parent: true } });
      if (row) return row;
    }
  } catch (e) { console.error('Prisma getCategoryBySlug failed:', (e as Error).message); }
  return (await import('@/lib/data/categories')).categories.find((c: any) => c.slug === slug);
}
