import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { ProductCard } from '@components/product/ProductCard';
import { getAllProducts } from '@/lib/api/products';
import { getBrandBySlug, getAllBrands } from '@lib/api/brands';
import { filterByBrand } from '@/lib/api/filters';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getAllBrands()).map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: 'Brand Tidak Ditemukan' };

  return {
    title: brand.name,
    description: `Jelajahi produk ${brand.name} di EBTPlaza.`,
    alternates: { canonical: `/brand/${slug}` },
  };
}

export default async function BrandProductPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const brandProducts = filterByBrand(await getAllProducts(), brand.id);

  return (
    <Container className="py-6">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Brand', href: '/brand' },
          { label: brand.name },
        ]}
      />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {brandProducts.length} produk
        </p>
      </div>

      {brandProducts.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {brandProducts.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-gray-500">Belum ada produk dari brand ini.</p>
        </div>
      )}
    </Container>
  );
}
