import { cn } from '@lib/utils/cn';

export interface SectionHeadingProps {
  overline?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeading({
  overline,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {overline && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
          {overline}
        </p>
      )}
      <h2 className="text-2xl font-bold text-primary sm:text-3xl">{title}</h2>
      {description && (
        <p className="mt-2 text-sm text-muted">{description}</p>
      )}
    </div>
  );
}
