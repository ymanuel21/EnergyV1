import { NextResponse } from 'next/server';
import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';

export async function GET() {
  try {
    await requireAuth();
    const prisma = await getAdminPrisma();
    const products = await prisma.product.findMany({
      include: { brand: true, categories: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'id', 'name', 'slug', 'sku', 'price', 'originalPrice',
      'brand', 'category', 'status', 'isActive',
      'description', 'specifications', 'downloads',
    ];

    const rows = products.map((p: any) => {
      const firstCat = p.categories?.[0]?.category?.name || '';
      return [
        p.id,
        escapeCsv(p.name),
        p.slug,
        p.sku || '',
        p.price,
        p.originalPrice || '',
        escapeCsv(p.brand?.name || ''),
        escapeCsv(firstCat),
        p.status || 'published',
        p.isActive ? 'true' : 'false',
        escapeCsv(p.description || ''),
        JSON.stringify(p.specifications || []),
        JSON.stringify(p.downloads || []),
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Export failed' }, { status: 500 });
  }
}

function escapeCsv(val: string): string {
  if (!val) return '';
  const escaped = val.replace(/"/g, '""');
  return `"${escaped}"`;
}
