import { NextResponse } from 'next/server';

// Public badges are read-only, fetched from the database via repository
export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const { Pool } = await import('pg');
    const { PrismaPg } = await import('@prisma/adapter-pg');
    if (!process.env.DATABASE_URL) return NextResponse.json([]);
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
    const badges = await prisma.badge.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    await pool.end();
    return NextResponse.json(badges);
  } catch {
    return NextResponse.json([]);
  }
}
