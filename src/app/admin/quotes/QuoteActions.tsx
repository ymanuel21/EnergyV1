'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', contacted: 'Contacted', survey_scheduled: 'Survey Scheduled',
  proposal_sent: 'Proposal Sent', won: 'Won', lost: 'Lost',
};

interface QuoteActionsProps {
  quoteId: string;
  currentStatus: string;
  nextActions: string[];
  handleStatusUpdate: (formData: FormData) => Promise<void>;
}

export function QuoteActions({ quoteId, currentStatus, nextActions, handleStatusUpdate }: QuoteActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(status: string) {
    setLoading(status);
    try {
      const fd = new FormData();
      fd.set('id', quoteId);
      fd.set('status', status);
      await handleStatusUpdate(fd);
      showToast('✓ Quote berhasil diperbarui', 'success');
      router.refresh();
    } catch {
      showToast('✕ Gagal memperbarui quote', 'error');
    } finally {
      setLoading(null);
    }
  }

  if (nextActions.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-muted">Quick Actions:</p>
      {nextActions.map(next => {
        const isLoading = loading === next;
        return (
          <button
            key={next}
            type="button"
            disabled={loading !== null}
            onClick={() => handleAction(next)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-50 inline-flex items-center gap-1.5 mr-2 ${
              next === 'won' ? 'bg-green-600 hover:bg-green-700' :
              next === 'lost' ? 'bg-red-600 hover:bg-red-700' :
              'bg-primary hover:bg-primary-hover'
            }`}
          >
            {isLoading && (
              <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {isLoading ? 'Updating...' : `Mark ${STATUS_LABELS[next]}`}
          </button>
        );
      })}
    </div>
  );
}
