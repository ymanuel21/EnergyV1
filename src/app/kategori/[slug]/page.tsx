import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { getCategoryProducts } from '@/lib/api/products';
import { resolvePriceLabels } from '@/lib/services/resolve-price-labels';
import { getCategoryBySlug } from '@/lib/api/categories';
import { validateSort, validatePage } from '@/lib/utils/validation';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateStaticParams() {
  const { categories } = await import('@/lib/data/categories');
  return categories.map((c: { slug: string }) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tr = await getTranslations();
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: tr('catalog.categoryNotFound') };

  return {
    title: category.name,
    description: `Explore the ${category.name} collection at EBTPlaza. ${category.productCount} products available.`,
    alternates: { canonical: `/kategori/${slug}` },
    openGraph: {
      title: `${category.name} — EBTPlaza`,
      description: `Explore the ${category.name} collection at EBTPlaza. ${category.productCount} products available.`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const tr = await getTranslations();
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sort = validateSort(sp.sort);
  const page = validatePage(sp.page);

  // Was: getAllProducts() + filterByCategory() + sortProducts() + paginate() in
  // JS. filterByCategory used the m2m `categories` rows and fell back to the
  // legacy single categoryId only for products with no m2m rows; the child
  // category walk used the same loaded `children` (one level). All of that is
  // now expressed in SQL, with the same ordering and the same page clamp.
  const categoryIds: string[] = [category.id, ...((category.children ?? []) as any[]).map((c: any) => c.id)];
  const { items: paginated, total, totalPages } = await getCategoryProducts({
    categoryIds,
    sort,
    page,
    perPage: 12,
  });
  const priceLabels = await resolvePriceLabels(paginated);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: tr('common.home'), href: '/' }, { label: category.name }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <p className="mt-1 text-sm text-gray-500">{tr('catalog.productsFound', { count: total })}</p>      </div>

      <div className="mt-4 flex items-center justify-between">
        <SortDropdown />
      </div>

      {paginated.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} variant="grid" priceLabel={priceLabels.get(product.id)} />
            ))}
          </div>

          <Pagination
            current={page}
            total={totalPages}
            baseUrl={`/kategori/${slug}`}
            params={{ sort }}
            className="mt-8"
          />
        </>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500">{tr('catalog.noProductsInThisCategory')}</p>
        </div>
      )}
    </Container>
  );
}
