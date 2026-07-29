export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct } from '../actions';
import { DeleteButton } from '../../DeleteButton';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div>
      <h1>Edit Produk: {product.name}</h1>
      <p>Server render OK</p>
      <DeleteButton />
      <p>✅ Client component (DeleteButton) works</p>
    </div>
  );
}
