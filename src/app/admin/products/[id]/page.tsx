export const dynamic = "force-dynamic";

import { notFound } from 'next/navigation';
import { getProduct, getBrandsForSelect, getCategoriesForSelect } from '../actions';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  try {
    const brands = await getBrandsForSelect();
    return (
      <div>
        <h1>Edit Produk: {product.name}</h1>
        <p>Brand: {product.brand?.name} | Status: {product.status}</p>
        <p>Brands loaded: {brands.length}</p>
        <p>Categories: {product.categories?.length}</p>
        <p>Specs count: {(product.specifications as any[])?.length}</p>
        <p>Images count: {(product.images as any[])?.length}</p>
        <p>BadgeRelations: {product.badgeRelations?.length}</p>
        <p>Relations: {product.relations?.length}</p>
        <hr />
        <p>✅ ALL DATA LOADED — crash is in ProductForm or child component</p>
      </div>
    );
  } catch (e: any) {
    return <div><h1>CRASH IN: getBrandsForSelect or render</h1><pre>{e.message}</pre></div>;
  }
}
