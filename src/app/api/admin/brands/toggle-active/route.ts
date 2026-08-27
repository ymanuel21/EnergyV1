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

    await prisma.brand.update({ where: { id }, data: { isActive: active } });

    revalidatePath('/');
    revalidatePath('/brand');
    revalidatePath('/admin/brands');

    return NextResponse.json({ success: true, isActive: active });
  } catch (err: any) {
    console.error('Brand toggle failed:', err.message);
    return NextResponse.json({ error: 'Toggle failed' }, { status: 500 });
  }
}
