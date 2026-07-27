import 'server-only';
import type { Product } from '@/types/product';
import { getPrisma } from '@/lib/db';

export async function getAllProducts(): Promise<Product[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.product.findMany({ where: { isActive: true }, include: { brand: true } });
      if (rows.length > 0) return rows as any as Product[];
    }
  } catch (e) { console.error('Prisma getAllProducts failed:', (e as Error).message); }
  return (await import('@/lib/data/products')).products;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const row = await prisma.product.findUnique({ where: { slug }, include: { brand: true } });
      if (row) return row as any as Product;
    }
  } catch (e) { console.error('Prisma getProductBySlug failed:', (e as Error).message); }
  return (await import('@/lib/data/products')).products.find((p: any) => p.slug === slug);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.product.findMany({
        where: { isActive: true, categories: { some: { categoryId } } },
        include: { brand: true },
      });
      if (rows.length > 0) return rows as any as Product[];
    }
  } catch (e) { console.error('Prisma getProductsByCategory failed:', (e as Error).message); }
  return (await import('@/lib/data/products')).products.filter(
    (p: any) => p.categoryId === categoryId,
  );
}
