import type { ProductBadgeVariant } from '@/types/product';

const BADGE_LABELS: Record<ProductBadgeVariant, string> = {
  clearance: 'Clearance',
  promo: 'Promo',
  new: 'Baru',
  cheapest: 'Termurah!',
};

const BADGE_COLORS: Record<ProductBadgeVariant, string> = {
  clearance: 'bg-red-100 text-red-700',
  promo: 'bg-accent-100 text-accent-700',
  new: 'bg-brand-100 text-brand-700',
  cheapest: 'bg-yellow-100 text-yellow-800',
};

interface ProductBadgeGroupProps {
  badges: ProductBadgeVariant[];
}

export function ProductBadgeGroup({ badges }: ProductBadgeGroupProps) {
  if (!badges.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge}
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_COLORS[badge]}`}
        >
          {BADGE_LABELS[badge]}
        </span>
      ))}
    </div>
  );
}
