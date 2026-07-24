export const dynamic = "force-dynamic";

import { getBrandsForSelect, getCategoriesForSelect, createProduct } from '../actions';
import { ProductForm } from '../ProductForm';

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([getBrandsForSelect(), getCategoriesForSelect()]);

  async function handleCreate(data: any) {
    'use server';
    await createProduct({ id: `p-${Date.now()}`, ...data });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Tambah Produk</h1>
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <ProductForm brands={brands} categories={categories} onSubmit={handleCreate} />
      </div>
    </div>
  );
}
