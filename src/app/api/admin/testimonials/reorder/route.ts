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

    const items = await prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx < 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= items.length) {
      return NextResponse.json({ error: 'Cannot move further' }, { status: 400 });
    }

    const current = items[idx];
    const swap = items[target];

    if (current.sortOrder === swap.sortOrder) {
      await prisma.testimonial.update({ where: { id: swap.id }, data: { sortOrder: swap.sortOrder + 1 } });
    }

    const tmp = current.sortOrder;
    await prisma.testimonial.update({ where: { id: current.id }, data: { sortOrder: swap.sortOrder } });
    await prisma.testimonial.update({ where: { id: swap.id }, data: { sortOrder: tmp } });

    revalidatePath('/admin/testimonials');
    revalidatePath('/testimoni');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Testimonial reorder failed:', err.message);
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
