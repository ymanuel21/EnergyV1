export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getAdminPrisma } from '../../../lib/admin-prisma';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

const IMPORT_DIR = path.join(process.cwd(), 'public/images/products/imported');

export default async function ImportPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const folder = path.join(IMPORT_DIR, slug);
  if (!fs.existsSync(folder)) notFound();

  const images = fs.readdirSync(folder)
    .filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))
    .map(f => `/images/products/imported/${slug}/${f}`);

  const name = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Check if already in DB
  const prisma = await getAdminPrisma();
  const existing = await prisma.product.findUnique({ where: { slug } });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products/import" className="text-muted hover:text-primary text-sm">← Back</Link>
        <h1 className="text-xl font-bold text-primary">{name}</h1>
        {existing && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">In Database</span>}
      </div>

      {/* Image Gallery */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {images.map((img, i) => (
          <div key={i} className="rounded-xl border border-border overflow-hidden">
            <img src={img} alt={`${name} - ${i + 1}`} className="w-full h-64 object-contain bg-surface" />
            <p className="p-2 text-xs text-muted text-center">Image {i + 1} of {images.length}</p>
          </div>
        ))}
      </div>

      {/* Quick import form */}
      {!existing && (
        <div className="rounded-xl border border-border bg-card p-6 max-w-lg">
          <h2 className="text-sm font-semibold text-primary mb-4">Quick Import</h2>
          <p className="text-xs text-muted mb-4">
            This creates a draft product with the images attached. You can fill in details (price, brand, specs) from the product editor after importing.
          </p>
          <div className="text-xs text-muted space-y-1 mb-4">
            <p>Product name: <strong className="text-primary">{name}</strong></p>
            <p>Slug: <strong className="text-primary">{slug}</strong></p>
            <p>Images: <strong className="text-primary">{images.length}</strong></p>
          </div>
          <form action={async () => {
            'use server';
            const prisma = await getAdminPrisma();
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
          }}>
            <button type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
              Import as Draft Product
            </button>
          </form>
        </div>
      )}

      {existing && (
        <Link href={`/admin/products/${slug}`}
          className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
          Edit in CMS →
        </Link>
      )}
    </div>
  );
}
