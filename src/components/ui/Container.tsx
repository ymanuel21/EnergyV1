import { cn } from '@lib/utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide';
}

export function Container({
  size = 'default',
  className,
  children,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    default: 'max-w-5xl',
    narrow: 'max-w-4xl',
    wide: 'max-w-[90rem]',
  };

  return (
    <div
      className={cn('mx-auto px-4 sm:px-6', sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
