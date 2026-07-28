export const dynamic = "force-dynamic";

import { notFound, redirect } from 'next/navigation';
import { getProduct, updateProduct, deleteProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { ProductForm } from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([
    getProduct(id),
    getBrandsForSelect(),
    getCategoriesForSelect(),
  ]);
  if (!product) notFound();

  async function handleUpdate(data: any) {
    'use server';
    await updateProduct(id, data);
  }

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
        <ProductForm defaultValues={product} brands={brands} categories={categories} onSubmit={handleUpdate} />
      </div>
    </div>
  );
}
