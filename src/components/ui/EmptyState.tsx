import { cn } from '@lib/utils/cn';
import { EmptyState as EmptyStateType } from './EmptyState';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export { type EmptyStateProps as EmptyStateType };

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <div className="mb-4 text-gray-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action.href ? (
            <a href={action.href}>
              <Button variant="primary" tabIndex={-1}>{action.label}</Button>
            </a>
          ) : (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
