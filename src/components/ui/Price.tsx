import { cn } from '@lib/utils/cn';
import { formatCurrency, discountPercent } from '@lib/utils/format';

export interface PriceProps {
  amount: number;
  originalAmount?: number;
  overrideLabel?: string;  // when set, shows this label instead of formatted price
  size?: 'sm' | 'md' | 'lg';
  showDiscountBadge?: boolean;
  className?: string;
}

export function Price({
  amount,
  originalAmount,
  overrideLabel,
  size = 'md',
  showDiscountBadge = true,
  className,
}: PriceProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (overrideLabel) {
    return (
      <div className={cn('flex items-baseline gap-2', sizeClasses[size], className)}>
        <span className="text-muted">{overrideLabel}</span>
      </div>
    );
  }

  const hasDiscount = originalAmount && originalAmount > amount;
  const discount = hasDiscount ? discountPercent(originalAmount!, amount) : 0;

  return (
    <div className={cn('flex items-baseline gap-2', sizeClasses[size], className)}>
      <span className="font-bold text-primary">{formatCurrency(amount)}</span>
      {hasDiscount && (
        <>
          <span className="text-sm text-muted line-through">
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
