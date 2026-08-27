'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Always-visible Enabled/Disabled pill used across the admin content pages.
 * POSTs `{ id, active }` to the given endpoint and refreshes the current route.
 * Mirrors the HomepageBuilder section-card styling for a consistent admin UX.
 */
export function VisibilityToggle({ id, active, endpoint }: { id: string; active: boolean; endpoint: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data && (data as any).error) || 'Gagal memperbarui status');
        return;
      }
      router.refresh();
    } catch {
      setError('Gagal memperbarui status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-0.5">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-pressed={!!active}
        title={active ? 'Klik untuk menonaktifkan' : 'Klik untuk mengaktifkan'}
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium border transition disabled:cursor-not-allowed disabled:opacity-50 ${
          active
            ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
            : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
        }`}
      >
        {loading ? '…' : active ? 'Enabled' : 'Disabled'}
      </button>
      {error && <span className="text-[9px] text-red-500">{error}</span>}
    </div>
  );
}
