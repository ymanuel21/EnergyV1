import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { filterByCategory, sortProducts, paginate } from '@/lib/api/filters';
import { getAllProducts } from '@/lib/api/products';
import { getCategoryBySlug } from '@/lib/data/categories';
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
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: 'Kategori Tidak Ditemukan' };

  return {
    title: category.name,
    description: `Jelajahi koleksi ${category.name} di EBTPlaza. ${category.productCount} produk tersedia.`,
    alternates: { canonical: `/kategori/${slug}` },
    openGraph: {
      title: `${category.name} — EBTPlaza`,
      description: `Jelajahi koleksi ${category.name} di EBTPlaza. ${category.productCount} produk tersedia.`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const sort = validateSort(sp.sort);
  const page = validatePage(sp.page);
  const isSubcategory = !!category.parentId;

  const filtered = filterByCategory(getAllProducts(), category.id, isSubcategory);
  const sorted = sortProducts(filtered, sort);
  const { items: paginated, totalPages } = paginate(sorted, page);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: category.name }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        <p className="mt-1 text-sm text-gray-500">{sorted.length} produk ditemukan</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <SortDropdown />
      </div>

      {paginated.length > 0 ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} variant="grid" />
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
          <p className="text-gray-500">Tidak ada produk dalam kategori ini.</p>
        </div>
      )}
    </Container>
  );
}
