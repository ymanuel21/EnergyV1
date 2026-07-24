import { cn } from '@lib/utils/cn';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  badge?: number;
}

export function IconButton({
  label,
  badge,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:text-brand-700 hover:bg-gray-100 transition-colors',
        className
      )}
      aria-label={label}
      {...props}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
