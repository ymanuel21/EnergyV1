export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { ProductForm } from '../ProductForm';
import { ProductDeleteButton } from '../ProductDeleteButton';

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
        <ProductDeleteButton id={id} productName={product.name} />
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
