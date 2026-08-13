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
        isActive: true,
        status: 'published',
        ...(exclude ? { id: { not: exclude } } : {}),
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
          { capacity: { contains: q, mode: 'insensitive' } },
          { familyKey: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, name: true, price: true, sku: true, model: true, capacity: true, brand: { select: { name: true } } },
      take: 10,
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([]);
  }
}
