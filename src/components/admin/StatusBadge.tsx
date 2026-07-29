'use client';

import { cn } from '@/lib/utils/cn';

type Status = 'draft' | 'published' | 'archived' | 'review_pending' | 'review_approved' | 'review_rejected';

const variantStyles: Record<Status, string> = {
  draft: 'bg-amber-50 text-amber-700',
  published: 'bg-green-50 text-green-700',
  archived: 'bg-red-50 text-red-700',
  review_pending: 'bg-blue-50 text-blue-700',
  review_approved: 'bg-emerald-50 text-emerald-700',
  review_rejected: 'bg-rose-50 text-rose-700',
};

const variantLabels: Record<Status, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  review_pending: 'Pending Review',
  review_approved: 'Approved',
  review_rejected: 'Rejected',
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[status],
        className
      )}
    >
      {variantLabels[status]}
    </span>
  );
}
