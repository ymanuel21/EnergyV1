export const dynamic = "force-dynamic";

import Link from 'next/link';
import { getProducts, getBrandsForSelect, getCategoriesForSelect } from './actions';
import { ProductTable } from './ProductTable';
import { ProductActions } from './ProductActions';

export default async function ProductsPage() {
  const [products, brands, categories] = await Promise.all([
    getProducts(),
    getBrandsForSelect(),
    getCategoriesForSelect(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-primary">Produk</h1>
        <div className="flex items-center gap-3">
          <ProductActions />
          <Link href="/admin/products/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover">
            + Tambah Produk
          </Link>
        </div>
      </div>

      <ProductTable products={products} brands={brands} categories={categories} />
    </div>
  );
}
