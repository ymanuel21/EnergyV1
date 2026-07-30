import Link from 'next/link';
import { ProductCard } from '@components/product/ProductCard';
import { resolvePriceLabels } from '@/lib/services/resolve-price-labels';
import type { Product } from '@/types/product';

interface ProductCarouselSectionProps {
  title: string;
  description?: string;
  linkTo?: string;
  products: Product[];
  titleIcon?: React.ReactNode;
}

export async function ProductCarouselSection({
  title,
  description,
  linkTo,
  products,
  titleIcon,
}: ProductCarouselSectionProps) {
  if (!products.length) return null;
  
  const priceLabels = await resolvePriceLabels(products as any[]);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2">
              {titleIcon}
              <h2 className="text-2xl font-light tracking-tight text-primary">{title}</h2>
            </div>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {linkTo && (
            <Link href={linkTo} className="hidden text-sm font-medium text-muted hover:text-primary transition-colors sm:inline-flex items-center gap-1 shrink-0">
              Lihat semua <span className="text-lg">→</span>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" priceLabel={priceLabels.get(product.id)} />
          ))}
        </div>

        {linkTo && (
          <div className="mt-6 sm:hidden">
            <Link href={linkTo} className="inline-flex items-center gap-1 text-sm font-medium text-muted">
              Lihat semua <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
