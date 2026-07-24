import Link from 'next/link';
import { SafeImage } from '@ui/SafeImage';
import { Badge } from '@ui/Badge';
import { Price } from '@ui/Price';
import { HeartIcon } from '@ui/Icons';
import type { Product, ProductBadgeVariant } from '@/types/product';
import { getBrandById } from '@/lib/data/brands';

const BADGE_LABELS: Record<ProductBadgeVariant, string> = {
  clearance: 'Clearance',
  promo: 'Promo',
  new: 'Baru',
  cheapest: 'Termurah!',
};

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'carousel';
  className?: string;
}

export function ProductCard({ product, variant = 'grid', className = '' }: ProductCardProps) {
  const brand = getBrandById(product.brandId);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <article className={`card group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md ${className}`}>
      {/* Image */}
      <Link href={`/produk/${product.slug}`} className="relative aspect-square overflow-hidden bg-gray-100">
        <SafeImage
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover transition group-hover:scale-105"
          sizes={variant === 'carousel' ? '240px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
        />

        {/* Badges */}
        {product.badges.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.badges.map((badge) => (
              <Badge key={badge} variant={badge}>
                {BADGE_LABELS[badge]}
              </Badge>
            ))}
          </div>
        )}

        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute right-2 top-2">
            <Badge variant="clearance">-{discountPercent}%</Badge>
          </div>
        )}

        {/* Wishlist button */}
        <button
          className="absolute right-2 bottom-2 rounded-full bg-white/90 p-1.5 text-gray-400 hover:text-red-500 transition-colors shadow-sm"
          aria-label={`Simpan ${product.name} ke wishlist`}
        >
          <HeartIcon className="h-4 w-4" />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        {brand && (
          <Link
            href={`/brand/${brand.slug}`}
            className="text-xs text-gray-500 hover:text-brand-700 transition-colors"
          >
            {brand.name}
          </Link>
        )}
        <Link
          href={`/produk/${product.slug}`}
          className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-brand-700 transition-colors"
        >
          {product.name}
        </Link>
        <Price
          amount={product.price}
          originalAmount={product.originalPrice}
          size="sm"
          showDiscountBadge={false}
        />
      </div>
    </article>
  );
}
