export const dynamic = "force-dynamic";

import { notFound, redirect } from 'next/navigation';
import { getProduct, deleteProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { ProductForm } from '../ProductForm';
import { getLatestReview } from '@/lib/services/review';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('[PAGE] A — id:', id);
  const [product, brands, categories, review] = await Promise.all([
    getProduct(id).then(p => { console.log('[PAGE] B — getProduct done'); return p; }),
    getBrandsForSelect().then(b => { console.log('[PAGE] C — getBrands done, count:', b.length); return b; }),
    getCategoriesForSelect().then(c => { console.log('[PAGE] D — getCategories done, count:', c.length); return c; }),
    getLatestReview('product', id).then(r => { console.log('[PAGE] E — getLatestReview done:', r?.status); return r; }),
  ]);
  console.log('[PAGE] F — all awaits done');
  if (!product) notFound();
  console.log('[PAGE] G — product found, rendering ProductForm');

  async function handleDelete() {
    'use server';
    await deleteProduct(id);
    redirect('/admin/products');
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Edit Produk</h1>
        <form action={handleDelete}>
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
            Hapus
          </button>
        </form>
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <ProductForm
          defaultValues={product}
          brands={brands}
          categories={categories}
          onSubmit={async () => {}}
          reviewStatus={review?.status || null}
          reviewNotes={review?.notes || null}
        />
      </div>
    </div>
  );
}
