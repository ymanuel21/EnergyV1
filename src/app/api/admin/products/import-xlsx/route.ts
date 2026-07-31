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
  const preview = formData.get('preview') === 'true';

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const arrayBuf = await file.arrayBuffer();
  const buf = Buffer.from(arrayBuf as ArrayBuffer) as any;
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);

  // Validate required sheets
  const requiredSheets = ['Products'];
  for (const name of requiredSheets) {
    if (!wb.getWorksheet(name)) {
      return NextResponse.json({
        error: `Missing required worksheet: "${name}". The workbook must contain a "${name}" sheet.`,
      }, { status: 400 });
    }
  }

  const productsSheet = wb.getWorksheet('Products')!;

  // Pre-scan: collect rows and detect duplicates
  const rows: any[] = [];
  const seenSlugs = new Map<string, number>();
  const seenSkus = new Map<string, number>();
  const errors: any[] = [];

  productsSheet.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const slug = cellStr(row, 3);
    const sku = cellStr(row, 4);

    if (slug) {
      if (seenSlugs.has(slug)) {
        errors.push({ sheet: 'Products', row: rowNum, column: 'Slug', message: `Duplicate slug "${slug}" — also found at row ${seenSlugs.get(slug)}` });
      } else seenSlugs.set(slug, rowNum);
    }
    if (sku) {
      if (seenSkus.has(sku)) {
        errors.push({ sheet: 'Products', row: rowNum, column: 'SKU', message: `Duplicate SKU "${sku}" — also found at row ${seenSkus.get(sku)}` });
      } else seenSkus.set(sku, rowNum);
    }

    rows.push({ rowNum, cells: rowCellStrs(row, 17) });
  });

  if (errors.length > 0) {
    return NextResponse.json({ errors, validationFailed: true }, { status: 422 });
  }

  // Pre-fetch lookup data
  const [brands, categories, existingProducts] = await Promise.all([
    prisma.brand.findMany({ select: { id: true, name: true } }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.product.findMany({ select: { id: true, slug: true, sku: true } }),
  ]);

  const brandByName = new Map(brands.map(b => [b.name.toLowerCase(), b.id]));
  const categoryByName = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));
  const existingBySlug = new Map(existingProducts.map(p => [p.slug, p.id]));
  const existingBySku = new Map(existingProducts.filter(p => p.sku).map(p => [p.sku!, p.id]));

  const previewData = { total: rows.length, create: 0, update: 0, skip: 0, errors: [] as any[] };

  // Resolve each row
  for (const { rowNum, cells } of rows) {
    const id = cells[0], name = cells[1], slug = cells[2], sku = cells[3], brandName = cells[4],
      status = cells[6] || 'published', featured = cells[7]?.toLowerCase() === 'yes';

    if (!name || !slug) {
      previewData.errors.push({ sheet: 'Products', row: rowNum, column: !name ? 'Name' : 'Slug', message: 'Required field missing' });
      continue;
    }

    let existingId: string | null = id && existingProducts.some(p => p.id === id) ? id : null;
    if (!existingId) existingId = existingBySlug.get(slug) || null;
    if (!existingId && sku) existingId = existingBySku.get(sku) || null;

    if (mode === 'create' && existingId) { previewData.skip++; continue; }
    if (mode === 'update' && !existingId) { previewData.skip++; continue; }

    // Validate brand (case-insensitive)
    if (brandName) {
      if (!brandByName.has(brandName.toLowerCase())) {
        previewData.errors.push({ sheet: 'Products', row: rowNum, column: 'Brand', message: `Unknown brand: "${brandName}"` });
        continue;
      }
    }

    if (existingId) previewData.update++;
    else previewData.create++;
  }

  // Return preview if requested
  if (preview) {
    return NextResponse.json(previewData);
  }

  // If validation failed, stop
  if (previewData.errors.length > 0) {
    return NextResponse.json(previewData, { status: 422 });
  }

  // Execute in single transaction
  const startTime = Date.now();
  const result = { created: 0, updated: 0, skipped: 0, errors: [] as any[] };

  try {
    await prisma.$transaction(async (tx: any) => {
      for (const { rowNum, cells } of rows) {
        const id = cells[0], name = cells[1], slug = cells[2], sku = cells[3], brandName = cells[4],
          catName = cells[5], status = cells[6] || 'published', featured = cells[7]?.toLowerCase() === 'yes',
          price = parseFloat(cells[8]) || 0, desc = cells[11] || '';

        if (!name || !slug) { result.skipped++; continue; }

        let existingId: string | null = id && existingProducts.some(p => p.id === id) ? id : null;
        if (!existingId) existingId = existingBySlug.get(slug) || null;
        if (!existingId && sku) existingId = existingBySku.get(sku) || null;

        if (mode === 'create' && existingId) { result.skipped++; continue; }
        if (mode === 'update' && !existingId) { result.skipped++; continue; }

        let brandId = brandName ? brandByName.get(brandName.toLowerCase()) || '' : '';

        try {
          const data: any = { name, slug, sku: sku || null, price, description: desc, status, isActive: featured };
          if (brandId) data.brandId = brandId;

          if (existingId) {
            await tx.product.update({ where: { id: existingId }, data });
            result.updated++;
          } else {
            const newId = `imp-${Date.now().toString(36)}-${rowNum}`;
            await tx.product.create({ data: { ...data, id: newId, stock: 0, badges: [] } });
            result.created++;
          }
        } catch (e: any) {
          throw e; // let transaction roll back
        }
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: `Import rolled back: ${e.message}` }, { status: 500 });
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  return NextResponse.json({
    ...result,
    duration: `${duration}s`,
    fileName: (file as any).name || 'unknown.xlsx',
    mode,
  });
}

// Helpers
function cellStr(row: ExcelJS.Row, col: number): string {
  const v = row.getCell(col).value;
  return v === null || v === undefined ? '' : String(v).trim();
}
function rowCellStrs(row: ExcelJS.Row, count: number): string[] {
  const out: string[] = [];
  for (let i = 1; i <= count; i++) out.push(cellStr(row, i));
  return out;
}
