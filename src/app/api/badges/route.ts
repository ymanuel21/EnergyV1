import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

// Public badges are read-only, fetched from the database via repository
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json([]);
    const prisma = await getPrisma();
    const badges = await prisma.badge.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(badges);
  } catch {
    return NextResponse.json([]);
  }
}
