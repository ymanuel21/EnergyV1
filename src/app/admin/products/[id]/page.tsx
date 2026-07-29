export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';
import { getLatestReview } from '@/lib/services/review';
import { TinyClient } from './TinyClient';

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
      <p>Brand: {product.brand?.name} ({brands.length} brands loaded)</p>
      <p>Categories: {categories.length}</p>
      <p>Specs: {(product.specifications as any[])?.length}</p>
      <p>BadgeRels: {product.badgeRelations?.length}</p>
      <hr />
      <TinyClient name={product.name} />
      <p>✅ TinyClient with use client — testing ProductForm next</p>
    </div>
  );
}
