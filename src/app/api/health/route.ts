import { NextResponse } from 'next/server';

export async function GET() {
  let db = false;
  try {
    if (process.env.DATABASE_URL) {
      const { getPrisma } = await import('@/lib/db');
      const prisma = await getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      db = true;
    }
  } catch {}

  return NextResponse.json({
    status: db ? 'healthy' : 'degraded',
    database: db ? 'connected' : 'disconnected',
    version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || 'dev',
    timestamp: new Date().toISOString(),
  }, { status: db ? 200 : 503 });
}
