export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct } from '../actions';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div>
      <h1>Edit Produk: {product.name}</h1>
      <p>ID: {product.id}</p>
      <p>Status: {product.status}</p>
      <p>Brand: {product.brand?.name}</p>
      <p>Categories: {product.categories?.length}</p>
      <p>Specs: {(product.specifications as any[])?.length}</p>
      <p>Images: {(product.images as any[])?.length}</p>
    </div>
  );
}
