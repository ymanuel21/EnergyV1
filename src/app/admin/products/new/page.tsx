export const dynamic = "force-dynamic";

import { randomUUID } from 'crypto';
import { getBrandsForSelect, getCategoriesForSelect, createProduct } from '../actions';
import { ProductForm } from '../ProductForm';
import type { ProductCreateResult } from '@/lib/product-errors';

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([getBrandsForSelect(), getCategoriesForSelect()]);

  async function handleCreate(data: any): Promise<ProductCreateResult> {
    'use server';
    // Collision-resistant id (keeps the `p-` namespace prefix, drops Date.now()).
    return createProduct({ id: `p-${randomUUID()}`, ...data });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Tambah Produk</h1>
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <ProductForm brands={brands} categories={categories} onSubmit={handleCreate} />
      </div>
    </div>
  );
}
