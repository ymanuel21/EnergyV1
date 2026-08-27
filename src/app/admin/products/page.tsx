export const dynamic = "force-dynamic";

import { getProducts, getBrandsForSelect, getCategoriesForSelect } from './actions';
import { ProductTable } from './ProductTable';

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ brand?: string; category?: string }> }) {
  const sp = await searchParams;
  const brandId = sp.brand || undefined;
  const categoryId = sp.category || undefined;

  const [products, brands, categories] = await Promise.all([
    getProducts({ brandId, categoryId }),
    getBrandsForSelect(),
    getCategoriesForSelect(),
  ]);

  return (
    <ProductTable
      products={products}
      brands={brands}
      categories={categories}
      currentBrand={brandId}
      currentCategory={categoryId}
    />
  );
}
