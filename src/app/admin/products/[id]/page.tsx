export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { getLatestReview } from '@/lib/services/review';

// Minimal ProductForm inline
function TestForm({ product }: { product: any }) {
  return <div>TEST FORM: {product.name}</div>;
}

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
      <TestForm product={product} />
      <hr />
      <p>✅ Minimal ProductForm OK — crash is in real ProductForm or sub-component</p>
    </div>
  );
}
