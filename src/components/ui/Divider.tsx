import { cn } from '@lib/utils/cn';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Divider({
  label,
  orientation = 'horizontal',
  className,
  ...props
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('h-full w-px bg-gray-200 shrink-0', className)}
        role="separator"
        aria-orientation="vertical"
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      />
    );
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <hr className="flex-1 border-gray-200" />
        <span className="text-sm text-gray-400">{label}</span>
        <hr className="flex-1 border-gray-200" />
      </div>
    );
  }

  return (
    <hr
      className={cn('border-gray-200', className)}
      {...props}
    />
  );
}
