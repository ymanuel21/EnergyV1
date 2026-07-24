import Link from 'next/link';
import { Container } from '@ui/Container';
import { ProductCard } from '@components/product/ProductCard';
import type { Product } from '@/types/product';

interface ProductCarouselSectionProps {
  title: string;
  description?: string;
  linkTo?: string;
  products: Product[];
  titleIcon?: React.ReactNode;
}

export function ProductCarouselSection({
  title,
  description,
  linkTo,
  products,
  titleIcon,
}: ProductCarouselSectionProps) {
  if (!products.length) return null;

  return (
    <section className="py-10">
      <Container>
        {/* Header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {titleIcon}
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            </div>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          {linkTo && (
            <Link
              href={linkTo}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-600 transition-colors shrink-0"
            >
              Lihat semua
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Carousel */}
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-4">
            {products.map((product) => (
              <div key={product.id} className="w-[220px] shrink-0 sm:w-[240px]">
                <ProductCard product={product} variant="carousel" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile "Lihat semua" */}
        {linkTo && (
          <div className="mt-4 sm:hidden">
            <Link
              href={linkTo}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-700"
            >
              Lihat semua
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
