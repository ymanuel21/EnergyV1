import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  const idsParam = request.nextUrl.searchParams.get('ids');
  const where: any = {};
  if (idsParam) {
    const ids = idsParam.split(',').filter(Boolean);
    where.id = { in: ids };
  }

  const products = await prisma.product.findMany({
    where,
    include: { brand: true, categories: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'EBTPlaza Admin';

  // ── Sheet 1: Products ──
  const ws1 = wb.addWorksheet('Products');
  ws1.columns = [
    { header: 'Product ID', key: 'id', width: 28 },
    { header: 'Name', key: 'name', width: 40 },
    { header: 'Slug', key: 'slug', width: 30 },
    { header: 'SKU', key: 'sku', width: 18 },
    { header: 'Brand', key: 'brand', width: 20 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Featured', key: 'featured', width: 12 },
    { header: 'Price', key: 'price', width: 16 },
    { header: 'Price Label', key: 'priceLabel', width: 16 },
    { header: 'Short Description', key: 'shortDescription', width: 50 },
    { header: 'Full Description', key: 'description', width: 60 },
    { header: 'Meta Title', key: 'metaTitle', width: 50 },
    { header: 'Meta Description', key: 'metaDescription', width: 60 },
    { header: 'Published', key: 'published', width: 14 },
    { header: 'Created At', key: 'createdAt', width: 20 },
    { header: 'Updated At', key: 'updatedAt', width: 20 },
  ];
  styleSheet(ws1);

  for (const p of products) {
    ws1.addRow({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku || '',
      brand: p.brand?.name || '',
      category: p.categories?.[0]?.category?.name || '',
      status: p.status || 'published',
      featured: p.isActive ? 'Yes' : 'No',
      price: p.price || 0,
      priceLabel: (p as any).priceLabel || '',
      shortDescription: (p as any).shortDescription || '',
      description: p.description || '',
      metaTitle: (p as any).metaTitle || '',
      metaDescription: (p as any).metaDescription || '',
      published: p.status === 'published' ? 'Yes' : 'No',
      createdAt: formatDate(p.createdAt),
      updatedAt: formatDate(p.updatedAt),
    });
  }

  // ── Sheet 2: Specifications ──
  const ws2 = wb.addWorksheet('Specifications');
  ws2.columns = [
    { header: 'Product ID', key: 'productId', width: 28 },
    { header: 'Product Name', key: 'productName', width: 40 },
    { header: 'Key', key: 'key', width: 30 },
    { header: 'Value', key: 'value', width: 40 },
  ];
  styleSheet(ws2);
  for (const p of products) {
    const specs = parseJsonArray(p.specifications);
    for (const s of specs) {
      ws2.addRow({ productId: p.id, productName: p.name, key: s.key || s.name || '', value: s.value || '' });
    }
  }

  // ── Sheet 3: Images ──
  const ws3 = wb.addWorksheet('Images');
  ws3.columns = [
    { header: 'Product ID', key: 'productId', width: 28 },
    { header: 'Product Name', key: 'productName', width: 40 },
    { header: 'Image URL', key: 'url', width: 60 },
    { header: 'Alt Text', key: 'alt', width: 40 },
    { header: 'Sort Order', key: 'sort', width: 12 },
    { header: 'Primary', key: 'primary', width: 10 },
  ];
  styleSheet(ws3);
  for (const p of products) {
    const imgs = parseJsonArray(p.images);
    imgs.forEach((img: any, i: number) => {
      const url = typeof img === 'string' ? img : img.url || img.src || '';
      const alt = typeof img === 'string' ? p.name : img.alt || '';
      ws3.addRow({ productId: p.id, productName: p.name, url, alt, sort: i, primary: i === 0 ? 'Yes' : 'No' });
    });
  }

  // ── Sheet 4: Downloads ──
  const ws4 = wb.addWorksheet('Downloads');
  ws4.columns = [
    { header: 'Product ID', key: 'productId', width: 28 },
    { header: 'Product Name', key: 'productName', width: 40 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'URL', key: 'url', width: 60 },
    { header: 'Type', key: 'type', width: 20 },
  ];
  styleSheet(ws4);
  for (const p of products) {
    const dls = parseJsonArray(p.downloads);
    for (const d of dls) {
      ws4.addRow({ productId: p.id, productName: p.name, title: d.title || d.name || '', url: d.url || d.file || '', type: d.type || '' });
    }
  }

  // ── Sheet 5: Related Products ──
  const ws5 = wb.addWorksheet('Related Products');
  ws5.columns = [
    { header: 'Product ID', key: 'productId', width: 28 },
    { header: 'Product Name', key: 'productName', width: 40 },
    { header: 'Related Product Slug', key: 'relatedSlug', width: 40 },
  ];
  styleSheet(ws5);
  // Product model may have productIds field for related
  for (const p of products) {
    const related = parseJsonArray((p as any).productIds);
    for (const r of related) {
      ws5.addRow({ productId: p.id, productName: p.name, relatedSlug: r });
    }
  }

  // ── Sheet 6: SEO ──
  const ws6 = wb.addWorksheet('SEO');
  ws6.columns = [
    { header: 'Product ID', key: 'productId', width: 28 },
    { header: 'Meta Title', key: 'metaTitle', width: 50 },
    { header: 'Meta Description', key: 'metaDescription', width: 60 },
    { header: 'Keywords', key: 'keywords', width: 50 },
    { header: 'Canonical URL', key: 'canonical', width: 60 },
  ];
  styleSheet(ws6);
  for (const p of products) {
    ws6.addRow({
      productId: p.id,
      metaTitle: (p as any).metaTitle || '',
      metaDescription: (p as any).metaDescription || '',
      keywords: (p as any).metaKeywords || '',
      canonical: (p as any).canonicalUrl || `https://ebtplaza.vercel.app/produk/${p.slug}`,
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  const filename = `ebtplaza-products-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

// ── Helpers ──

function styleSheet(ws: ExcelJS.Worksheet) {
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } };
  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 24;
  // Alternating row colors
  for (let i = 2; i <= 10000; i++) {
    const row = ws.getRow(i);
    if (i % 2 === 0) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  }
}

function parseJsonArray(val: any): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  return [];
}

function formatDate(d: Date | string | null): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}
