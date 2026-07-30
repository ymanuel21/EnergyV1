import Link from 'next/link';
import { SafeImage } from '@ui/SafeImage';
import { Badge } from '@ui/Badge';
import { Price } from '@ui/Price';
import { HeartIcon } from '@ui/Icons';
import type { Product, ProductBadgeVariant } from '@/types/product';

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
  brandName?: string;
  brandSlug?: string;
  priceLabel?: string;  // pre-resolved pricing label from server
}

export function ProductCard({ product, variant = 'grid', className = '', brandName, brandSlug, priceLabel }: ProductCardProps) {
  // Use DB-provided brand data when available; fall back to flattened fields
  const brand = (brandName && brandSlug)
    ? { name: brandName, slug: brandSlug, logo: '' }
    : (product as any).brand
    ? { name: (product as any).brand.name, slug: (product as any).brand.slug, logo: (product as any).brand.logo }
    : null;

  const productBadges: string[] = (product as any).badgeRelations?.map((r: any) => r.badge?.variant || r.badge?.name) || (product.badges as string[]) || [];
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <article className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white transition hover:shadow-lg ${className}`}>
      {/* Image */}
      <Link href={`/produk/${product.slug}`} className="relative aspect-square overflow-hidden bg-surface">
        <SafeImage
          src={product.images[0]}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-contain p-4 transition group-hover:scale-105"
          sizes={variant === 'carousel' ? '240px' : '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'}
        />

        {/* Badges */}
        {productBadges.length > 0 && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {productBadges.map((badge, i) => (
              <Badge key={i} variant={badge as ProductBadgeVariant}>
                {BADGE_LABELS[badge as ProductBadgeVariant]}
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
          className="absolute right-2 bottom-2 rounded-full bg-white/90 p-1.5 text-muted hover:text-red-500 transition-colors"
          aria-label={`Simpan ${product.name} ke wishlist`}
        >
          <HeartIcon className="h-4 w-4" />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-1 p-4">
        {brand && (
          <Link
            href={`/brand/${brand.slug}`}
            className="text-xs text-muted hover:text-primary transition-colors"
          >
            {brand.name}
          </Link>
        )}
        <Link
          href={`/produk/${product.slug}`}
          className="text-sm font-medium text-primary line-clamp-2 hover:text-primary transition-colors"
        >
          {product.name}
        </Link>
        <Price
          amount={product.price}
          originalAmount={product.originalPrice}
          overrideLabel={priceLabel}
          size="sm"
          showDiscountBadge={false}
        />
      </div>
    </article>
  );
}
