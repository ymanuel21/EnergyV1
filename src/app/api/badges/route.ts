import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function GET() {
  try {
    const prisma = await getPrisma();
    const badges = await prisma.badge.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return NextResponse.json(badges);
  } catch {
    return NextResponse.json([]);
  }
}
