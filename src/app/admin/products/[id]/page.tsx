export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct } from '../actions';
import { ProductForm } from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  // Test: ProductForm with minimal props
  return (
    <div>
      <h1>Edit Produk: {product.name}</h1>
      <p>Server render OK</p>
      <ProductForm
        defaultValues={{ name: product.name }}
        brands={[]}
        categories={[]}
        onSubmit={async () => {}}
      />
      <p>✅ ProductForm with minimal props rendered</p>
    </div>
  );
}
