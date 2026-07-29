import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prismaInstance: PrismaClient | null = null;

export async function getAdminPrisma(): Promise<PrismaClient> {
  if (prismaInstance) return prismaInstance;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');

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

export async function requireAuth() {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');
  return session;
}
