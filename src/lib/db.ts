import 'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prismaInstance: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (prismaInstance) return prismaInstance;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const pool = new Pool({
    connectionString: url,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });
  const adapter = new PrismaPg(pool);
  prismaInstance = new PrismaClient({ adapter });
  return prismaInstance;
}

export async function prismaOrFallback<T>(
  prismaFn: (prisma: PrismaClient) => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const result = await prismaFn(prisma);
      if (Array.isArray(result) && result.length > 0) return result;
      if (result && !Array.isArray(result)) return result;
    }
  } catch (e) {
    console.error('Prisma query failed:', (e as Error).message);
  }
  return fallback();
}
