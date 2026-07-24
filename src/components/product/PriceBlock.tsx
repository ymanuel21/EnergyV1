import { cn } from '@lib/utils/cn';
import { formatCurrency, discountPercent } from '@lib/utils/format';

interface PriceBlockProps {
  price: number;
  originalPrice?: number;
  stock: number;
  className?: string;
}

export function PriceBlock({ price, originalPrice, stock, className }: PriceBlockProps) {
  const hasDiscount = originalPrice && originalPrice > price;
  const discount = hasDiscount ? discountPercent(originalPrice!, price) : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-gray-900">{formatCurrency(price)}</span>
        {hasDiscount && (
          <>
            <span className="text-lg text-gray-400 line-through">
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
        <span className="text-gray-400"> ({stock} pcs)</span>
      </p>
    </div>
  );
}
