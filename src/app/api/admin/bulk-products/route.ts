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

    // Capture slugs + brandIds before mutation so affected public pages can be invalidated.
    const affected = await prisma.product.findMany({ where: { id: { in: ids } }, select: { slug: true, brandId: true } });
    const slugs = affected.map((p) => p.slug);
    const brandIds = new Set<string>(affected.map((p) => p.brandId).filter((b): b is string => Boolean(b)));

    let message = '';
    switch (action) {
      case 'publish':
        // Complete published state: visible (isActive) AND published (status), matching
        // the single-product Publish flow (publishEntity).
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true, status: 'published' } });
        message = `${ids.length} products published`;
        break;

      case 'archive':
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
        message = `${ids.length} products archived`;
        break;

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
        message = `${ids.length} products moved`;
        break;

      case 'changeBrand':
        if (!brandId) return NextResponse.json({ error: 'No brand selected' }, { status: 400 });
        await prisma.product.updateMany({ where: { id: { in: ids } }, data: { brandId } });
        message = `${ids.length} products moved`;
        break;

      case 'delete':
        // Hard delete (matches single-product deleteProduct): clean up polymorphic reviews first
        await prisma.review.deleteMany({ where: { entityType: 'product', entityId: { in: ids } } });
        await prisma.product.deleteMany({ where: { id: { in: ids } } });
        message = `${ids.length} products deleted`;
        break;

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Invalidate admin list + public product listing and each affected detail page.
    revalidatePath('/admin/products');
    revalidatePath('/produk');
    for (const slug of slugs) revalidatePath(`/produk/${slug}`);

    // Invalidate affected brand pages (changeBrand also moves products to a new brand).
    if (action === 'changeBrand' && brandId) brandIds.add(brandId);
    if (brandIds.size) {
      const brands = await prisma.brand.findMany({ where: { id: { in: Array.from(brandIds) } }, select: { slug: true } });
      for (const b of brands) revalidatePath(`/brand/${b.slug}`);
    }

    return NextResponse.json({ message });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
  }
}
