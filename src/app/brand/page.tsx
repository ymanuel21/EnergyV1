import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { BrandLogo } from '@ui/BrandLogo';
import { getAllBrands } from '@lib/api/brands';
import { products } from '@/lib/data/products';

export const metadata: Metadata = {
  title: 'Brand',
  description: 'Jelajahi produk berdasarkan brand di EBTPlaza.',
  alternates: { canonical: '/brand' },
};

export default async function BrandPage() {
  const brands = await getAllBrands();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Brand' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Brand</h1>
        <p className="mt-1 text-sm text-gray-500">{brands.length} brand</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {brands.map((brand) => {
          const count = products.filter((p) => p.brandId === brand.id).length;
          return (
            <Link
              key={brand.id}
              href={`/brand/${brand.slug}`}
              className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 p-6 text-center transition hover:shadow-md hover:border-brand-200"
            >
              <BrandLogo name={brand.name} logo={brand.logo} size="md" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{brand.name}</h3>
                <p className="text-xs text-gray-500">{count} produk</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Container>
  );
}
