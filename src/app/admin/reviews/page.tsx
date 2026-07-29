export const dynamic = 'force-dynamic';

import { getReviewQueue } from '@/lib/services/review';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ReviewActions } from './ReviewActions';
import { ReviewFilters } from './ReviewFilters';

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; entity?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || 'pending';
  const entity = params.entity || 'all';

  const reviews = await getReviewQueue({
    status: status === 'all' ? undefined : status,
    entityType: entity as any,
  });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-primary mb-6">Review Queue</h1>

      <ReviewFilters currentStatus={status} currentEntity={entity} />

      <div className="rounded-xl border border-border bg-card mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left font-medium text-primary">Entity</th>
              <th className="p-3 text-left font-medium text-primary">Type</th>
              <th className="p-3 text-left font-medium text-primary">Status</th>
              <th className="p-3 text-left font-medium text-primary hidden md:table-cell">Requested By</th>
              <th className="p-3 text-left font-medium text-primary hidden md:table-cell">Reviewed By</th>
              <th className="p-3 text-left font-medium text-primary hidden lg:table-cell">Requested</th>
              <th className="p-3 text-left font-medium text-primary hidden lg:table-cell">Reviewed</th>
              <th className="p-3 text-left font-medium text-primary hidden xl:table-cell">Notes</th>
              <th className="p-3 text-right font-medium text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r: any) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-surface/50 transition">
                <td className="p-3 font-medium text-primary max-w-[180px] truncate">{r.entityName}</td>
                <td className="p-3">
                  <span className="text-xs uppercase tracking-wide text-muted">{r.entityType}</span>
                </td>
                <td className="p-3">
                  <StatusBadge status={
                    r.status === 'pending' ? 'review_pending' :
                    r.status === 'approved' ? 'review_approved' : 'review_rejected'
                  } />
                </td>
                <td className="p-3 hidden md:table-cell text-muted text-xs">{r.requestedBy || '—'}</td>
                <td className="p-3 hidden md:table-cell text-muted text-xs">{r.reviewedBy || '—'}</td>
                <td className="p-3 hidden lg:table-cell text-muted text-xs">
                  {new Date(r.requestedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-3 hidden lg:table-cell text-muted text-xs">
                  {r.reviewedAt ? new Date(r.reviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td className="p-3 hidden xl:table-cell text-muted text-xs max-w-[150px] truncate">
                  {r.notes || '—'}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  {r.status === 'pending' && (
                    <ReviewActions reviewId={r.id} entityType={r.entityType} entityName={r.entityName} />
                  )}
                  {r.status === 'approved' && (
                    <span className="text-xs text-green-600">✓ Approved</span>
                  )}
                  {r.status === 'rejected' && (
                    <span className="text-xs text-red-600" title={r.notes || ''}>
                      ✗ Rejected{r.notes ? `: ${r.notes.slice(0, 40)}${r.notes.length > 40 ? '…' : ''}` : ''}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr><td colSpan={9} className="p-8 text-center text-muted">
                {status === 'pending' ? 'No pending reviews.' :
                 status === 'approved' ? 'No approved reviews.' :
                 status === 'rejected' ? 'No rejected reviews.' :
                 'No reviews found.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
