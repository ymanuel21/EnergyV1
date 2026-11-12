import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { searchProductsPaginated } from '@/lib/api/products';
import { resolvePriceLabels } from '@/lib/services/resolve-price-labels';
import { validateSort, validatePage } from '@/lib/utils/validation';
import { SITE } from '@lib/constants';

interface Props {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const tr = await getTranslations();
  const sp = await searchParams;
  const q = sp.q?.trim();
  if (!q) {
    return {
      title: tr('search.searchProducts'),
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
  const tr = await getTranslations();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const sort = validateSort(sp.sort);
  const page = validatePage(sp.page);

  // Was: getAllProducts() + searchProducts() + sortProducts() + paginate() in JS
  // (the whole catalogue read per search). Same six search fields, same sort
  // mapping and the same 12-per-page clamp, now executed in SQL.
  const { items: paginated, total: matchedCount, totalPages } = await searchProductsPaginated({
    q,
    sort,
    page,
    perPage: 12,
  });
  const priceLabels = await resolvePriceLabels(paginated);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: tr('common.home'), href: '/' }, { label: tr('common.searchAction') }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {q ? `Search results: "${q}"` : 'Search Products'}
        </h1>
        {q && (
          <p className="mt-1 text-sm text-gray-500">
            {matchedCount > 0 ? tr('catalog.productsFound', { count: matchedCount }) : tr('search.noProductsFound')}          </p>
        )}
      </div>

      {q.length < 2 ? (
        <div className="py-20 text-center">
          <p className="text-gray-500">{tr('search.enterAtLeast2CharactersToSearch')}</p>
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
