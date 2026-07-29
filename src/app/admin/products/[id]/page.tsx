export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { getLatestReview } from '@/lib/services/review';
import { ProductForm2 } from './ProductForm2';

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
      <h1>Edit Produk: {product.name}</h1>
      <p>Brands: {brands.length} | Categories: {categories.length}</p>
      <ProductForm2
        defaultValues={product}
        brands={brands}
        categories={categories}
        onSubmit={async () => {}}
        reviewStatus={review?.status || null}
        reviewNotes={review?.notes || null}
      />
      <p>✅ ProductForm2 (fresh file) rendered</p>
    </div>
  );
}
