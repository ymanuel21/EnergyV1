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

    const product = await prisma.product.update({ where: { id }, data: { isActive: active }, select: { slug: true, brandId: true } });

    revalidatePath('/');
    revalidatePath('/produk');
    revalidatePath(`/produk/${product.slug}`);
    revalidatePath('/admin/products');

    const brand = await prisma.brand.findUnique({ where: { id: product.brandId }, select: { slug: true } });
    if (brand) revalidatePath(`/brand/${brand.slug}`);

    return NextResponse.json({ success: true, isActive: active });
  } catch (err: any) {
    console.error('Product toggle failed:', err.message);
    return NextResponse.json({ error: 'Toggle failed' }, { status: 500 });
  }
}
