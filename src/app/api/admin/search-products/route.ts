import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';

export async function GET(req: NextRequest) {
  await requireAuth();
  const q = req.nextUrl.searchParams.get('q') || '';
  const exclude = req.nextUrl.searchParams.get('exclude') || '';

  if (!q.trim()) return NextResponse.json([]);

  try {
    const prisma = await getAdminPrisma();
    const products = await prisma.product.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
        isActive: true,
        ...(exclude ? { id: { not: exclude } } : {}),
      },
      select: { id: true, name: true, price: true, brand: { select: { name: true } } },
      take: 10,
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([]);
  }
}
