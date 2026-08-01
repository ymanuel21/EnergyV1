export const dynamic = "force-dynamic";

import { getProducts, getBrandsForSelect, getCategoriesForSelect } from './actions';
import { ProductTable } from './ProductTable';

export default async function ProductsPage() {
  const [products, brands, categories] = await Promise.all([
    getProducts(),
    getBrandsForSelect(),
    getCategoriesForSelect(),
  ]);

  return <ProductTable products={products} brands={brands} categories={categories} />;
}
