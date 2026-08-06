export const dynamic = "force-dynamic";

import { notFound, redirect } from 'next/navigation';
import { getProduct, deleteProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { ProductForm } from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    getProduct(id),
    getBrandsForSelect(),
    getCategoriesForSelect(),
  ]);
  if (!product) notFound();

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
          onSubmit={async (data: any) => { 'use server'; }}
        />
      </div>
    </div>
  );
}
