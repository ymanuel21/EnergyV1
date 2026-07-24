import 'server-only';
import { getPrisma } from '@/lib/db';

export async function getAllBrands(): Promise<any[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
      if (rows.length > 0) return rows;
    }
  } catch (e) { console.error('Prisma getAllBrands failed:', (e as Error).message); }
  return (await import('@/lib/data/brands')).brands as any[];
}

export async function getBrandById(id: string): Promise<any> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const row = await prisma.brand.findUnique({ where: { id } });
      if (row) return row;
    }
  } catch (e) { console.error('Prisma getBrandById failed:', (e as Error).message); }
  return (await import('@/lib/data/brands')).brands.find((b: any) => b.id === id);
}

export async function getBrandBySlug(slug: string): Promise<any> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const row = await prisma.brand.findUnique({ where: { slug } });
      if (row) return row;
    }
  } catch (e) { console.error('Prisma getBrandBySlug failed:', (e as Error).message); }
  return (await import('@/lib/data/brands')).brands.find((b: any) => b.slug === slug);
}

export async function getActiveBrands(): Promise<any[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.brand.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
      if (rows.length > 0) return rows;
    }
  } catch (e) { console.error('Prisma getActiveBrands failed:', (e as Error).message); }
  return (await import('@/lib/data/brands')).brands as any[];
}
