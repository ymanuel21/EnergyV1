import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const prisma = await getAdminPrisma();
  
  try {
    const body = await request.json();
    const { id, direction } = body as { id: string; direction: 'up' | 'down' };

    if (!id || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Fetch all projects ordered by sortOrder
    const projects = await prisma.project.findMany({ orderBy: { sortOrder: 'asc' } });
    const idx = projects.findIndex((p: any) => p.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= projects.length) {
      return NextResponse.json({ error: 'Cannot move further' }, { status: 400 });
    }

    // Swap sortOrder; handle duplicates
    const current = projects[idx];
    const swap = projects[target];

    if (current.sortOrder === swap.sortOrder) {
      await prisma.project.update({ where: { id: swap.id }, data: { sortOrder: swap.sortOrder + 1 } });
    }

    const tmp = current.sortOrder;
    await prisma.project.update({ where: { id: current.id }, data: { sortOrder: swap.sortOrder } });
    await prisma.project.update({ where: { id: swap.id }, data: { sortOrder: tmp } });

    revalidatePath('/admin/projects');
    revalidatePath('/proyek');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Reorder failed:', err.message);
    return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
  }
}
