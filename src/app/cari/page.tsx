import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { searchProducts, sortProducts, paginate } from '@/lib/api/filters';
import { getAllProducts } from '@/lib/api/products';
import { resolvePriceLabels } from '@/lib/services/resolve-price-labels';
import { validateSort, validatePage } from '@/lib/utils/validation';
import { SITE } from '@lib/constants';

interface Props {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q?.trim();
  if (!q) {
    return {
      title: 'Search Products',
      description: `Search solar panels, inverters, batteries and other renewable energy products at ${SITE.name}.`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: `"${q}" — Search Results`,
    description: `Search results for "${q}" at ${SITE.name}.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const sort = validateSort(sp.sort);
  const page = validatePage(sp.page);

  const matched = q.length >= 2 ? searchProducts(await getAllProducts(), q) : [];
  const sorted = sortProducts(matched, sort);
  const { items: paginated, totalPages } = paginate(sorted, page);
  const priceLabels = await resolvePriceLabels(paginated);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {q ? `Search results: "${q}"` : 'Search Products'}
        </h1>
        {q && (
          <p className="mt-1 text-sm text-gray-500">
            {matched.length > 0 ? `${matched.length} products found` : 'No products found'}
          </p>
        )}
      </div>

      {q.length < 2 ? (
        <div className="py-20 text-center">
          <p className="text-gray-500">Enter at least 2 characters to search for products.</p>
        </div>
      ) : paginated.length > 0 ? (
        <>
          <div className="mt-4 flex items-center justify-between">
            <SortDropdown />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} variant="grid" priceLabel={priceLabels.get(product.id)} />
            ))}
          </div>
          <Pagination
            current={page}
            total={totalPages}
            baseUrl="/cari"
            params={{ q, sort }}
            className="mt-8"
          />
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500">Tidak ada produk yang cocok dengan &ldquo;{q}&rdquo;.</p>
        </div>
      )}
    </Container>
  );
}
