import { cn } from '@lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        clearance: 'bg-red-100 text-red-700',
        promo: 'bg-accent-100 text-accent-700',
        new: 'bg-gray-100 text-gray-900',
        cheapest: 'bg-yellow-100 text-yellow-800',
      },
    },
    defaultVariants: {
      variant: 'promo',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
