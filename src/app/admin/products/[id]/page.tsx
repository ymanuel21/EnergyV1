export const dynamic = "force-dynamic";

import { notFound, redirect } from 'next/navigation';
import { getProduct, deleteProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { ProductForm } from '../ProductForm';
import { getLatestReview } from '@/lib/services/review';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  let id = '';
  try {
    const p = await params;
    id = p.id;
    console.log('[PAGE] A — id:', id);
  } catch (e: any) {
    console.error('[PAGE] A — params.resolve FAILED', e.message, e.stack?.split('\n')[1]?.trim());
    throw e;
  }

  let product: any, brands: any[], categories: any[], review: any;

  try {
    product = await getProduct(id);
    console.log('[PAGE] B — getProduct OK');
  } catch (e: any) {
    console.error('[PAGE] B — getProduct FAILED for', id, e.message, e.stack?.split('\n')[1]?.trim());
    throw e;
  }

  try {
    brands = await getBrandsForSelect();
    console.log('[PAGE] C — getBrands OK, count:', brands.length);
  } catch (e: any) {
    console.error('[PAGE] C — getBrands FAILED', e.message, e.stack?.split('\n')[1]?.trim());
    throw e;
  }

  try {
    categories = await getCategoriesForSelect();
    console.log('[PAGE] D — getCategories OK, count:', categories.length);
  } catch (e: any) {
    console.error('[PAGE] D — getCategories FAILED', e.message, e.stack?.split('\n')[1]?.trim());
    throw e;
  }

  try {
    review = await getLatestReview('product', id);
    console.log('[PAGE] E — getLatestReview OK:', review?.status || 'null');
  } catch (e: any) {
    console.error('[PAGE] E — getLatestReview FAILED', e.message, e.stack?.split('\n')[1]?.trim());
    throw e;
  }

  console.log('[PAGE] F — all awaits done');
  if (!product) notFound();
  console.log('[PAGE] G — product found, rendering ProductForm');

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Edit Produk</h1>
        <form action={async () => { 'use server'; await deleteProduct(id); redirect('/admin/products'); }}>
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
