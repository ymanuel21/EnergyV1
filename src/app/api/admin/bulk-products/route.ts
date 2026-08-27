import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const fd = await req.formData();
    const ids = JSON.parse(fd.get('ids') as string) as string[];
    const action = fd.get('action') as string;
    const categoryId = fd.get('categoryId') as string;
    const brandId = fd.get('brandId') as string;

    if (!ids?.length) return NextResponse.json({ error: 'No products selected' }, { status: 400 });

    const prisma = await getAdminPrisma();

    switch (action) {
      case 'publish':
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true } });
        return NextResponse.json({ message: `${ids.length} products published` });

      case 'archive':
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
        return NextResponse.json({ message: `${ids.length} products archived` });

      case 'changeCategory':
        if (!categoryId) return NextResponse.json({ error: 'No category selected' }, { status: 400 });
        // Update legacy categoryId for each product, and upsert ProductCategory
        for (const pid of ids) {
          await prisma.product.update({ where: { id: pid }, data: { categoryId } });
          await prisma.productCategory.upsert({
            where: { productId_categoryId: { productId: pid, categoryId } },
            create: { productId: pid, categoryId },
            update: {},
          });
        }
        return NextResponse.json({ message: `${ids.length} products moved` });

      case 'changeBrand':
        if (!brandId) return NextResponse.json({ error: 'No brand selected' }, { status: 400 });
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { brandId } });
        return NextResponse.json({ message: `${ids.length} products moved` });

      case 'delete':
        // Hard delete (matches single-product deleteProduct): clean up polymorphic reviews first
        await prisma.review.deleteMany({ where: { entityType: 'product', entityId: { in: ids } } });
        await prisma.product.deleteMany({ where: { id: { in: ids } } });
        revalidatePath('/admin/products');
        return NextResponse.json({ message: `${ids.length} products deleted` });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
