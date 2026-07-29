export const dynamic = "force-dynamic";

import { getProduct, getBrandsForSelect, getCategoriesForSelect } from '../products/actions';
import { getLatestReview } from '@/lib/services/review';
import { ProductForm } from '../products/ProductForm';

export default async function TestFormPage() {
  const id = 'eco-ecoflow-river-3-max-plus-858wh';
  
  console.error('[TEST-FORM:1] fetching product...');
  const [product, brands, categories, review] = await Promise.all([
    getProduct(id).then(p => { console.error('[TEST-FORM:2] getProduct OK, name:', p?.name); return p; }),
    getBrandsForSelect().then(b => { console.error('[TEST-FORM:3] getBrands OK, count:', b.length); return b; }),
    getCategoriesForSelect().then(c => { console.error('[TEST-FORM:4] getCategories OK, count:', c.length); return c; }),
    getLatestReview('product', id).then(r => { console.error('[TEST-FORM:5] getLatestReview OK:', r?.status); return r; }),
  ]);

  if (!product) return <h1>Product not found</h1>;

  console.error('[TEST-FORM:6] rendering ProductForm...');

  return (
    <div>
      <h1>Test Form: {product.name}</h1>
      <ProductForm
        defaultValues={product}
        brands={brands}
        categories={categories}
        onSubmit={async () => {}}
        reviewStatus={review?.status || null}
        reviewNotes={review?.notes || null}
      />
      <p>✅ ProductForm rendered on test route</p>
    </div>
  );
}
