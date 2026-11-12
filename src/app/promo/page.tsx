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
  title: tr('meta.promo.title'),
  description: tr('meta.promo.description'),
  alternates: { canonical: '/promo' },
  };
}

interface Props {
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export default async function PromoPage({ searchParams }: Props) {
  const tr = await getTranslations();
  const sp = await searchParams;
  const sort = validateSort(sp.sort);
  const page = validatePage(sp.page);

  // Was: getAllProducts() + filterByBadge() + sortProducts() + paginate() in JS.
  // `badges` is a Json array column, so `array_contains` reproduces the JS
  // `p.badges.includes('promo')` test in SQL.
  const { items: paginated, total, totalPages } = await getProductsByBadge('promo', { sort, page });
  const priceLabels = await resolvePriceLabels(paginated);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Promotions' }]} />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr('promo.promotionsOffers')}</h1>
          <p className="mt-1 text-sm text-gray-500">{tr('promo.summarySpecial', { count: total })}</p>        </div>
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
            baseUrl="/promo"
            params={{ sort }}
            className="mt-8"
          />
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500">{tr('promo.noPromotionalProductsAtTheMoment')}</p>
        </div>
      )}
    </Container>
  );
}
