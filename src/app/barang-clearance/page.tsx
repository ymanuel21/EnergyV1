import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { getProductsByBadge } from '@/lib/api/products';
import { resolvePriceLabels } from '@/lib/services/resolve-price-labels';
import { validateSort, validatePage } from '@/lib/utils/validation';

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations();
  return {
  title: 'Clearance',
  description: tr('meta.barang-clearance.description'),
  alternates: { canonical: '/barang-clearance' },
  };
}

interface Props {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function ClearancePage({ searchParams }: Props) {
  const tr = await getTranslations();
  const sp = await searchParams;
  const sort = validateSort(sp.sort);
  const page = validatePage(sp.page);

  // Was: getAllProducts() + filterByBadge() + sortProducts() + paginate() in JS.
  const { items: paginated, total, totalPages } = await getProductsByBadge('clearance', { sort, page });
  const priceLabels = await resolvePriceLabels(paginated);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Clearance' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Clearance</h1>
        <p className="mt-1 text-sm text-gray-500">{tr('clearance.summaryLimited', { count: total })}</p>      </div>

      {paginated.length > 0 ? (
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
            baseUrl="/barang-clearance"
            params={{ sort }}
            className="mt-8"
          />
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500">{tr('clearance.noClearanceProductsAtTheMoment')}</p>
        </div>
      )}
    </Container>
  );
}
