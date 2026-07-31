import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';
import ExcelJS from 'exceljs';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const mode = (formData.get('mode') as string) || 'sync';

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const arrayBuf = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuf as ArrayBuffer) as any;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  const result = { created: 0, updated: 0, skipped: 0, errors: [] as any[] };

  const productsSheet = wb.getWorksheet('Products');
  if (!productsSheet) {
    result.errors.push({ sheet: 'Workbook', row: 0, column: '', message: 'Missing Products sheet' });
    return NextResponse.json(result, { status: 400 });
  }

  const [brands, categories, existingProducts] = await Promise.all([
    prisma.brand.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.product.findMany({ select: { id: true, slug: true, sku: true } }),
  ]);

  const brandByName = new Map(brands.map(b => [b.name.toLowerCase(), b.id]));
  const categoryByName = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
  const existingBySlug = new Map(existingProducts.map(p => [p.slug, p.id]));
  const existingBySku = new Map(existingProducts.filter(p => p.sku).map(p => [p.sku!, p.id]));

  const specsByProduct = groupSheet(wb.getWorksheet('Specifications'));
  const imagesByProduct = groupSheet(wb.getWorksheet('Images'));
  const downloadsByProduct = groupSheet(wb.getWorksheet('Downloads'));
  const seoByProduct = groupSheet(wb.getWorksheet('SEO'));

  // Collect rows synchronously, then process async
  const rows: { rowNum: number; cells: string[] }[] = [];
  productsSheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    rows.push({ rowNum, cells: [cell(row, 1), cell(row, 2), cell(row, 3), cell(row, 4), cell(row, 5), cell(row, 6), cell(row, 7), cell(row, 8), cell(row, 9), cell(row, 10), cell(row, 11), cell(row, 12)] });
  });

  for (const { rowNum, cells } of rows) {
    const id = cells[0], name = cells[1], slug = cells[2], sku = cells[3], brandName = cells[4],
      catName = cells[5], status = cells[6] || 'published', price = parseFloat(cells[8]) || 0,
      desc = cells[11] || '', featured = cells[7]?.toLowerCase() === 'yes';

    if (!name || !slug) {
      result.errors.push({ sheet: 'Products', row: rowNum, column: !name ? 'Name' : 'Slug', message: 'Required field missing' });
      continue;
    }

    let existingId: string | null = id && existingProducts.some(p => p.id === id) ? id : null;
    if (!existingId) existingId = existingBySlug.get(slug) || null;
    if (!existingId && sku) existingId = existingBySku.get(sku) || null;

    if (mode === 'create' && existingId) {
      result.skipped++;
      continue;
    }
    if (mode === 'update' && !existingId) {
      result.skipped++;
      continue;
    }

    let brandId = '';
    if (brandName) {
      brandId = brandByName.get(brandName.toLowerCase()) || '';
      if (!brandId) {
        result.errors.push({ sheet: 'Products', row: rowNum, column: 'Brand', message: `Unknown brand: ${brandName}` });
        continue;
      }
    }

    try {
      const data: any = {
        name, slug, sku: sku || null, price,
        description: desc,
        status, isActive: featured,
      };
      if (brandId) data.brandId = brandId;

      if (existingId) {
        await prisma.product.update({ where: { id: existingId }, data });
        if (catName) {
          const catId = categoryByName.get(catName.toLowerCase());
          if (catId) {
            await prisma.productCategory.deleteMany({ where: { productId: existingId } });
            await prisma.productCategory.create({ data: { productId: existingId, categoryId: catId } });
          }
        }
        result.updated++;
      } else {
        const newId = `imp-${Date.now().toString(36)}-${rowNum}`;
        await prisma.product.create({ data: { ...data, id: newId, stock: 0, badges: [] } });
        if (catName) {
          const catId = categoryByName.get(catName.toLowerCase());
          if (catId) await prisma.productCategory.create({ data: { productId: newId, categoryId: catId } });
        }
        result.created++;
      }
    } catch (e: any) {
      result.errors.push({ sheet: 'Products', row: rowNum, column: '', message: e.message });
    }
  }

  return NextResponse.json(result);
}

function cell(row: ExcelJS.Row, col: number): string {
  const v = row.getCell(col).value;
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function groupSheet(ws: ExcelJS.Worksheet | undefined): Map<string, any[]> {
  const map = new Map<string, any[]>();
  if (!ws) return map;
  const headers: string[] = [];
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) { row.eachCell((c, i) => { headers[i] = String(c.value || '').toLowerCase(); }); return; }
    const id = cell(row, 1);
    if (!id) return;
    const obj: any = { productId: id };
    row.eachCell((c, i) => { if (i > 1) obj[headers[i] || `col${i}`] = String(c.value || ''); });
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(obj);
  });
  return map;
}
