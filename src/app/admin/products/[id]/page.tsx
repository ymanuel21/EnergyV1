export const dynamic = "force-dynamic";

// Test: does merely importing ProductForm cause a crash?
import { ProductForm } from '../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <h1>Edit Produk</h1>
      <p>✅ Page loads — ProductForm imported but not rendered</p>
      <p>Type: {typeof ProductForm}</p>
      <hr />
      <ProductForm brands={[]} categories={[]} onSubmit={async () => {}} />
      <p>✅ ProductForm rendered with no props</p>
    </div>
  );
}
