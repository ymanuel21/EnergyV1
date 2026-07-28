import { NextResponse } from 'next/server';
import { getMetrics } from '@/lib/observability';
import { cache } from '@/lib/platform';
import { featureFlags } from '@/lib/platform';
import { pluginRegistry } from '@/lib/platform';

export async function GET() {
  try {
    const { getPrisma } = await import('@/lib/db');
    const prisma = await getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    const db = true;

    const metrics = getMetrics();

    return NextResponse.json({
      status: db ? 'healthy' : 'degraded',
      database: db ? 'connected' : 'disconnected',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 8) || 'dev',
      timestamp: new Date().toISOString(),
      metrics: {
        ...metrics,
        cache: { entries: cache.size() },
      },
      flags: featureFlags.getAll(),
      plugins: pluginRegistry.list(),
    });
  } catch {
    return NextResponse.json({ status: 'degraded', database: 'error' }, { status: 503 });
  }
}
