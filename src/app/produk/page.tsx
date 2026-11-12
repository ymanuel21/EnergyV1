import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import type { SortOption } from '@/types/product';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { getProductsPaginated } from '@/lib/api/products';
import { resolvePriceDisplay } from '@/lib/services/product-pricing';
import { validateSort, validatePage } from '@/lib/utils/validation';

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations();
  return { title: tr('meta.produk.title'), description: tr('meta.produk.description') };
}

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const PAGE_SIZE = 12;

export default async function AllProductsPage({ searchParams }: Props) {
  const tr = await getTranslations();
  const sp = await searchParams;
  const sort = validateSort(sp.sort as string | undefined);
  const page = validatePage(sp.page as string | undefined);
  const offset = (page - 1) * PAGE_SIZE;

  // Map UI sort values to API sort format
  const sortMap: Record<string, string> = {
    'price-asc': 'price_asc',
    'price-desc': 'price_desc',
  };
  const apiSort = (sortMap[sort] || sort) as any as 'newest' | 'price_asc' | 'price_desc' | 'name';

  const { items: products, total } = await getProductsPaginated({
    limit: PAGE_SIZE,
    offset,
    sort: apiSort,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Resolve price display for all products
  const priceLabels = new Map<string, string | undefined>();
  await Promise.all(products.map(async (p) => {
    const pd = await resolvePriceDisplay(p as any);
    if (pd.mode !== 'SHOW_PRICE') priceLabels.set(p.id, pd.label);
  }));

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: tr('common.home'), href: '/' }, { label: tr('meta.produk.title') }]} />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr('meta.produk.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {total} produk tersedia
          </p>
        </div>
        <SortDropdown />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priceLabel={priceLabels.get(product.id)} priority={index < 4} />
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

      {products.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-500">
          Tidak ada produk tersedia saat ini.
        </p>
      )}
    </Container>
  );
}
