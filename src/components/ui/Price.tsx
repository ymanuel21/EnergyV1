import { cn } from '@lib/utils/cn';
import { formatCurrency, discountPercent } from '@lib/utils/format';

export interface PriceProps {
  amount: number;
  originalAmount?: number;
  size?: 'sm' | 'md' | 'lg';
  showDiscountBadge?: boolean;
  className?: string;
}

export function Price({
  amount,
  originalAmount,
  size = 'md',
  showDiscountBadge = true,
  className,
}: PriceProps) {
  const hasDiscount = originalAmount && originalAmount > amount;
  const discount = hasDiscount ? discountPercent(originalAmount!, amount) : 0;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn('flex items-baseline gap-2', sizeClasses[size], className)}>
      <span className="font-bold text-gray-900">{formatCurrency(amount)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-gray-400 line-through">
            {formatCurrency(originalAmount!)}
          </span>
          {showDiscountBadge && discount > 0 && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">
              -{discount}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
