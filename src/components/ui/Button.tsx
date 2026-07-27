import { cn } from '@lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';
import { SpinnerIcon } from './Icons';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-gray-800 text-white hover:bg-gray-900 shadow-sm',
        outline: 'border border-gray-800 text-gray-900 hover:bg-gray-50',
        ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        whatsapp: 'bg-green-500 text-white hover:bg-green-600 shadow-sm',
        link: 'text-gray-900 underline-offset-4 hover:underline',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <SpinnerIcon />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

export { buttonVariants };
