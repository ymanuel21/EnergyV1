import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';

interface ImportRow {
  row: number;
  data: Record<string, string>;
}

interface ImportError {
  row: number;
  reason: string;
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    const prisma = await getAdminPrisma();

    const body = await req.json();
    const { rows, mapping }: { rows: ImportRow[]; mapping: Record<string, string> } = body;

    if (!rows?.length) {
      return NextResponse.json({ error: 'No rows to import' }, { status: 400 });
    }

    if (!mapping?.name || !mapping?.slug) {
      return NextResponse.json({ error: 'name and slug mappings are required' }, { status: 400 });
    }

    // Pre-fetch brands and categories for validation
    const [brands, categories] = await Promise.all([
      prisma.brand.findMany({ select: { name: true, id: true } }),
      prisma.category.findMany({ select: { name: true, id: true } }),
    ]);

    const brandMap = new Map(brands.map(b => [b.name.toLowerCase(), b.id]));
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

    // Get existing slugs
    const existingSlugs = new Set(
      (await prisma.product.findMany({ select: { slug: true } })).map(p => p.slug)
    );

    const imported: string[] = [];
    const errors: ImportError[] = [];

    const mappedField = (row: Record<string, string>, field: string): string => {
      const csvCol = Object.entries(mapping).find(([, v]) => v === field)?.[0];
      return csvCol ? (row[csvCol] || '').trim() : '';
    };

    const mappedInt = (row: Record<string, string>, field: string): number | null => {
      const val = mappedField(row, field);
      if (!val) return null;
      const n = parseInt(val.replace(/[^0-9]/g, ''));
      return isNaN(n) ? null : n;
    };

    // Validate and import each row
    for (const { row: rowNum, data } of rows) {
      const name = mappedField(data, 'name');
      const slug = mappedField(data, 'slug');

      // Validation
      if (!name) { errors.push({ row: rowNum, reason: 'Missing name' }); continue; }
      if (!slug) { errors.push({ row: rowNum, reason: 'Missing slug' }); continue; }
      if (existingSlugs.has(slug)) { errors.push({ row: rowNum, reason: `Duplicate slug: ${slug}` }); continue; }

      const brandName = mappedField(data, 'brand');
      let brandId: string | null = null;
      if (brandName) {
        brandId = brandMap.get(brandName.toLowerCase()) || null;
        if (!brandId) { errors.push({ row: rowNum, reason: `Unknown brand: ${brandName}` }); continue; }
      }

      const categoryName = mappedField(data, 'category');
      let categoryId: string | null = null;
      if (categoryName) {
        categoryId = categoryMap.get(categoryName.toLowerCase()) || null;
      }

      const price = mappedInt(data, 'price') || 0;
      if (price < 0) { errors.push({ row: rowNum, reason: 'Invalid price' }); continue; }

      let specs: any[] = [];
      try { specs = JSON.parse(mappedField(data, 'specifications') || '[]'); } catch { /* keep [] */ }
      let downloads: any[] = [];
      try { downloads = JSON.parse(mappedField(data, 'downloads') || '[]'); } catch { /* keep [] */ }

      try {
        const productId = `imp-${Date.now().toString(36)}-${rowNum}`;
        await prisma.product.create({
          data: {
            id: productId,
            name,
            slug,
            sku: mappedField(data, 'sku') || null,
            price,
            originalPrice: mappedInt(data, 'originalPrice'),
            description: mappedField(data, 'description') || '',
            brandId: brandId || '',
            categoryId,
            status: 'draft',
            draftData: {},
            isActive: false,
            stock: 0,
            specifications: specs,
            downloads,
            images: [],
            badges: [],
          },
        });

        existingSlugs.add(slug);
        imported.push(slug);

        // Create category relation if category mapped
        if (categoryId) {
          await prisma.productCategory.create({
            data: { productId, categoryId },
          });
        }
      } catch (e: any) {
        errors.push({ row: rowNum, reason: e.message || 'Database error' });
      }
    }

    return NextResponse.json({
      imported: imported.length,
      skipped: errors.length,
      errors,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Import failed' }, { status: 500 });
  }
}
