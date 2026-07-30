import { cn } from '@lib/utils/cn';
import { formatCurrency, discountPercent } from '@lib/utils/format';

interface PriceBlockProps {
  price: number;
  originalPrice?: number;
  stock: number;
  overrideLabel?: string;
  className?: string;
}

export function PriceBlock({ price, originalPrice, stock, overrideLabel, className }: PriceBlockProps) {
  if (overrideLabel) {
    return (
      <div className={cn('flex items-baseline gap-2', className)}>
        <span className="text-lg text-muted">{overrideLabel}</span>
      </div>
    );
  }
  const hasDiscount = originalPrice && originalPrice > price;
  const discount = hasDiscount ? discountPercent(originalPrice!, price) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-primary">{formatCurrency(price)}</span>
        {hasDiscount && (
          <>
            <span className="text-lg text-muted line-through">
              {formatCurrency(originalPrice!)}
            </span>
            <span className="rounded bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-700">
              Hemat {discount}%
            </span>
          </>
        )}
      </div>
      <p className="text-sm">
        <span className="text-green-600 font-medium">Stok tersedia</span>
        <span className="text-muted"> ({stock} pcs)</span>
      </p>
    </div>
  );
}
