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

    // status is the authoritative public visibility field; keep legacy `published` in sync.
    await prisma.testimonial.update({
      where: { id },
      data: active
        ? { status: 'published', published: true }
        : { status: 'archived', published: false },
    });

    revalidatePath('/');
    revalidatePath('/testimoni');
    revalidatePath('/admin/testimonials');

    return NextResponse.json({ success: true, status: active ? 'published' : 'archived' });
  } catch (err: any) {
    console.error('Testimonial toggle failed:', err.message);
    return NextResponse.json({ error: 'Toggle failed' }, { status: 500 });
  }
}
