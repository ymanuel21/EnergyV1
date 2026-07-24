import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { SortDropdown } from '@components/category/SortDropdown';
import { Pagination } from '@ui/Pagination';
import { searchProducts, sortProducts, paginate } from '@/lib/api/filters';
import { getAllProducts } from '@/lib/api/products';
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
      title: 'Cari Produk',
      description: `Cari panel surya, inverter, baterai, dan produk energi terbarukan lainnya di ${SITE.name}.`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: `"${q}" — Hasil Pencarian`,
    description: `Hasil pencarian untuk "${q}" di ${SITE.name}.`,
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const sort = validateSort(sp.sort);
  const page = validatePage(sp.page);

  const matched = q.length >= 2 ? searchProducts(getAllProducts(), q) : [];
  const sorted = sortProducts(matched, sort);
  const { items: paginated, totalPages } = paginate(sorted, page);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Pencarian' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {q ? `Hasil pencarian: "${q}"` : 'Cari Produk'}
        </h1>
        {q && (
          <p className="mt-1 text-sm text-gray-500">
            {matched.length > 0 ? `${matched.length} produk ditemukan` : 'Tidak ada produk ditemukan'}
          </p>
        )}
      </div>

      {q.length < 2 ? (
        <div className="py-20 text-center">
          <p className="text-gray-500">Masukkan minimal 2 karakter untuk mencari produk.</p>
        </div>
      ) : paginated.length > 0 ? (
        <>
          <div className="mt-4 flex items-center justify-between">
            <SortDropdown />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} variant="grid" />
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
