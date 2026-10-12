import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { filterByBadge, sortProducts, paginate } from '@/lib/api/filters';
import { getAllProducts } from '@/lib/api/products';
import { resolvePriceLabels } from '@/lib/services/resolve-price-labels';
import { validateSort, validatePage } from '@/lib/utils/validation';

export const metadata: Metadata = {
  title: 'Clearance',
  description: 'Limited stock of renewable energy products at EBTPlaza. Lowest prices!',
  alternates: { canonical: '/barang-clearance' },
};

interface Props {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function ClearancePage({ searchParams }: Props) {
  const sp = await searchParams;
  const sort = validateSort(sp.sort);
  const page = validatePage(sp.page);

  const filtered = filterByBadge(await getAllProducts(), 'clearance');
  const sorted = sortProducts(filtered, sort);
  const { items: paginated, totalPages } = paginate(sorted, page);
  const priceLabels = await resolvePriceLabels(paginated);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Clearance' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Clearance</h1>
        <p className="mt-1 text-sm text-gray-500">Limited stock • Lowest price! • {filtered.length} products</p>
      </div>

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
          <p className="text-gray-500">No clearance products at the moment.</p>
        </div>
      )}
    </Container>
  );
}
