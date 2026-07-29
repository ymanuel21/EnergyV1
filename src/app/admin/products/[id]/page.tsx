export const dynamic = "force-dynamic";

import { notFound, redirect } from 'next/navigation';
import { getProduct, deleteProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { ProductForm } from '../ProductForm';
import { getLatestReview } from '@/lib/services/review';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  let id = '';
  try { const p = await params; id = p.id; console.error('[PAGE:1] params resolved, id:', id); } catch (e: any) { console.error('[PAGE:1] FAIL:', e.message); throw e; }

  let product: any;
  try { product = await getProduct(id); console.error('[PAGE:2] getProduct OK, name:', product?.name, 'specs count:', product?.specifications?.length); } catch (e: any) { console.error('[PAGE:2] getProduct FAIL:', e.message, e.stack?.split('\n').slice(1,3).join(' | ')); throw e; }
  if (!product) notFound();

  let brands: any[];
  try { brands = await getBrandsForSelect(); console.error('[PAGE:3] getBrands OK, count:', brands.length); } catch (e: any) { console.error('[PAGE:3] getBrands FAIL:', e.message); throw e; }

  let categories: any[];
  try { categories = await getCategoriesForSelect(); console.error('[PAGE:4] getCategories OK, count:', categories.length); } catch (e: any) { console.error('[PAGE:4] getCategories FAIL:', e.message); throw e; }

  let review: any;
  try { review = await getLatestReview('product', id); console.error('[PAGE:5] getLatestReview OK'); } catch (e: any) { console.error('[PAGE:5] getLatestReview FAIL:', e.message); throw e; }

  console.error('[PAGE:6] all data ready, rendering ProductForm...');

  try {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Edit Produk</h1>
          <form action={async () => { 'use server'; await deleteProduct(id); redirect('/admin/products'); }}>
            <button className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">Hapus</button>
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
  } catch (e: any) {
    console.error('[PAGE:6] RENDER FAIL:', e.message, e.stack?.split('\n').slice(1,4).join(' | '));
    throw e;
  }
}
