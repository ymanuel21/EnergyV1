export const dynamic = "force-dynamic";
import { ProductForm } from '../products/ProductForm';

export default function TestPage() {
  return (
    <div>
      <h1>Test — zero defaultValues</h1>
      <ProductForm brands={[]} categories={[]} onSubmit={async (data: any) => { 'use server'; }} />
    </div>
  );
}
