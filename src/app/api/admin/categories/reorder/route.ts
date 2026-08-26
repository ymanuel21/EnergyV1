import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prisma = await getAdminPrisma();

  try {
    const body = await request.json();
    const { id, direction } = body as { id: string; direction: 'up' | 'down' };

    if (!id || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const target = await prisma.category.findUnique({ where: { id } });
    if (!target) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    // Scope the ordering to siblings: top-level categories (parentId null) order
    // among themselves; children order within their own parent.
    const siblings = await prisma.category.findMany({
      where: { parentId: target.parentId ?? null },
      orderBy: { sortOrder: 'asc' },
    });

    const idx = siblings.findIndex((c: any) => c.id === id);
    if (idx < 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      return NextResponse.json({ error: 'Cannot move further' }, { status: 400 });
    }

    const current = siblings[idx];
    const swap = siblings[swapIdx];

    if (current.sortOrder === swap.sortOrder) {
      await prisma.category.update({ where: { id: swap.id }, data: { sortOrder: swap.sortOrder + 1 } });
    }

    const tmp = current.sortOrder;
    await prisma.category.update({ where: { id: current.id }, data: { sortOrder: swap.sortOrder } });
    await prisma.category.update({ where: { id: swap.id }, data: { sortOrder: tmp } });

    revalidatePath('/admin/categories');
    revalidatePath('/kategori');
    revalidatePath('/produk');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Category reorder failed:', err.message);
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
