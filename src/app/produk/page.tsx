import type { Metadata } from 'next';
import type { SortOption } from '@/types/product';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { getAllProducts } from '@/lib/api/products';
import { sortProducts, paginate } from '@/lib/api/filters';
import { validateSort, validatePage } from '@/lib/utils/validation';

export const metadata: Metadata = {
  title: 'Semua Produk',
  description: 'Jelajahi seluruh produk energi terbarukan: panel surya, inverter, baterai, dan lainnya.',
  alternates: { canonical: '/produk' },
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 12;

export default async function AllProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sort = validateSort(sp.sort as string | undefined);
  const page = validatePage(sp.page as string | undefined);

  const products = getAllProducts();
  const sorted = sortProducts(products, sort);
  const { items, totalPages } = paginate(sorted, page, PAGE_SIZE);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Semua Produk' }]} />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semua Produk</h1>
          <p className="mt-1 text-sm text-gray-500">
            {products.length} produk tersedia
          </p>
        </div>
        <SortDropdown />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          current={page}
          total={totalPages}
          baseUrl="/produk"
          params={{ sort }}
          className="mt-8"
        />
      )}

      {items.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500">
          Tidak ada produk tersedia saat ini.
        </p>
      )}
    </Container>
  );
}
