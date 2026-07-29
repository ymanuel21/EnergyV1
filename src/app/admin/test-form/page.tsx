export const dynamic = "force-dynamic";
import { ProductForm } from '@/app/admin/products/ProductForm';

export default function TestPage() {
  return (
    <div>
      <h1>Test ProductForm</h1>
      <ProductForm 
        defaultValues={{ name: 'Test', id: 'x' }} 
        brands={[]} 
        categories={[]} 
        onSubmit={undefined as any} 
      />
    </div>
  );
}
