import 'server-only';
import type { Product } from '@/types/product';

let prismaInstance: any = null;

async function getPrisma() {
  if (prismaInstance) return prismaInstance;
  if (!process.env.DATABASE_URL) {
    const { PrismaClient } = await import('@prisma/client');
    prismaInstance = new PrismaClient();
    return prismaInstance;
  }
  const { Pool } = await import('pg');
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { PrismaClient } = await import('@prisma/client');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
  return prismaInstance;
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const prisma = await getPrisma();
    return await prisma.product.findMany({ where: { isActive: true } });
  } catch {
    return (await import('@/lib/data/products')).products;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const prisma = await getPrisma();
    return await prisma.product.findUnique({ where: { slug } });
  } catch {
    return (await import('@/lib/data/products')).products.find((p: any) => p.slug === slug);
  }
}
