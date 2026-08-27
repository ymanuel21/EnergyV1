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
    const { id, active } = body as { id: string; active: boolean };

    if (!id || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await prisma.project.update({ where: { id }, data: { published: active } });

    revalidatePath('/');
    revalidatePath('/proyek');
    revalidatePath('/admin/projects');

    return NextResponse.json({ success: true, published: active });
  } catch (err: any) {
    console.error('Project toggle failed:', err.message);
    return NextResponse.json({ error: 'Toggle failed' }, { status: 500 });
  }
}
