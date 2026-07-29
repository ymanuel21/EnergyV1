export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { getLatestReview } from '@/lib/services/review';
import { ProductForm } from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, brands, categories, review] = await Promise.all([
    getProduct(id),
    getBrandsForSelect(),
    getCategoriesForSelect(),
    getLatestReview('product', id),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1>Edit Produk</h1>
      <ProductForm
        defaultValues={product}
        brands={brands}
        categories={categories}
        onSubmit={async () => {}}
        reviewStatus={review?.status || null}
        reviewNotes={review?.notes || null}
      />
    </div>
  );
}
