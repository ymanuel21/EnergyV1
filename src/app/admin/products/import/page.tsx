export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

const IMPORT_DIR = path.join(process.cwd(), 'public/images/products/imported');

export default async function ProductImportPage() {
  const prisma = await getAdminPrisma();

  // Scan imported image folders
  let folders: { name: string; slug: string; images: string[] }[] = [];
  if (fs.existsSync(IMPORT_DIR)) {
    folders = fs.readdirSync(IMPORT_DIR)
      .filter(f => fs.statSync(path.join(IMPORT_DIR, f)).isDirectory())
      .map(f => ({
        name: f.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        slug: f,
        images: fs.readdirSync(path.join(IMPORT_DIR, f))
          .filter(img => /\.(png|jpg|jpeg|webp)$/i.test(img))
          .map(img => `/images/products/imported/${f}/${img}`),
      }));
  }

  // Check which already exist in DB
  const existingSlugs = new Set(
    (await prisma.product.findMany({ select: { slug: true } })).map(p => p.slug)
  );

  async function handleImport(formData: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    const slug = formData.get('slug') as string;
    const name = formData.get('name') as string;
    if (!slug || !name) return;

    const folder = path.join(IMPORT_DIR, slug);
    const images = fs.existsSync(folder)
      ? fs.readdirSync(folder).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f)).map(f => `/images/products/imported/${slug}/${f}`)
      : [];

    const id = `imp-${Date.now().toString(36)}-${slug}`;
    await prisma.product.create({
      data: {
        id, name, slug,
        description: '', price: 0, stock: 0,
        images, specifications: [], downloads: [], badges: [],
        brandId: '', categoryId: null,
        status: 'draft', draftData: {}, isActive: false,
      },
    });
    revalidatePath('/admin/products/import');
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">Import Products from Images</h1>
        <span className="text-sm text-muted">{folders.length} product folders · 45 images</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {folders.map(f => {
          const exists = existingSlugs.has(f.slug);
          return (
            <div key={f.slug} className={`rounded-xl border bg-card overflow-hidden ${exists ? 'border-green-300' : 'border-border'}`}>
              {f.images[0] && (
                <img src={f.images[0]} alt={f.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-primary text-sm">{f.name}</h3>
                  {exists && <span className="text-xs text-green-600">✓ In DB</span>}
                </div>
                <p className="text-xs text-muted mt-1">{f.images.length} images</p>
                <div className="flex gap-2 mt-3">
                  {!exists ? (
                    <form action={handleImport} className="flex-1">
                      <input type="hidden" name="slug" value={f.slug} />
                      <input type="hidden" name="name" value={f.name} />
                      <button type="submit"
                        className="w-full rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-hover">
                        Import as Draft
                      </button>
                    </form>
                  ) : (
                    <Link href={`/admin/products/${f.slug}`}
                      className="flex-1 text-center rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface">
                      Edit in CMS
                    </Link>
                  )}
                  <Link href={`/admin/products/import/${f.slug}`}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface">
                    Preview
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
