import { cn } from '@lib/utils/cn';

export interface VisuallyHiddenProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  as?: 'span' | 'div';
}

export function VisuallyHidden({
  as: Component = 'span',
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <Component
      className={cn(
        'absolute h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]',
        className
      )}
      {...props}
    />
  );
}
