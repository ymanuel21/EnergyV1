'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { approveReview, rejectReview } from '@/lib/services/review';

export function ReviewActions({ reviewId, entityType, entityName }: {
  reviewId: string;
  entityType: string;
  entityName: string;
}) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = useCallback(async () => {
    setLoading(true);
    try {
      await approveReview(reviewId);
      setLoading(false);
      router.refresh();
    } catch {
      setLoading(false);
    }
  }, [reviewId, router]);

  const handleReject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const reason = (form.elements.namedItem('reason') as HTMLTextAreaElement)?.value || '';
      await rejectReview(reviewId, reason || 'No reason provided');
      setShowReject(false);
      setLoading(false);
      router.refresh();
    } catch {
      setLoading(false);
    }
  }, [reviewId, router]);

  return (
    <div className="flex items-center gap-2 justify-end">
      <button onClick={handleApprove} disabled={loading}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 transition disabled:opacity-50">
        {loading ? '...' : 'Approve'}
      </button>

      <button onClick={() => setShowReject(true)} disabled={loading}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition">
        Reject
      </button>

      {showReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowReject(false)}>
          <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-primary mb-3">
              Reject {entityType}: {entityName}
            </h3>
            <form onSubmit={handleReject} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-primary mb-1">Reason (optional)</label>
                <textarea name="reason" rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none bg-card resize-y"
                  placeholder="e.g. Missing specifications, incorrect pricing..." />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowReject(false)}
                  className="rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-surface">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
                  {loading ? '...' : 'Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
