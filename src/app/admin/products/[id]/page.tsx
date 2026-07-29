export const dynamic = "force-dynamic";

import { ProductForm } from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <h1>Edit Produk</h1>
      <ProductForm
        defaultValues={{ name: 'Test', id: 'x' }}
        brands={[]}
        categories={[]}
        onSubmit={undefined as any}
      />
    </div>
  );
}
