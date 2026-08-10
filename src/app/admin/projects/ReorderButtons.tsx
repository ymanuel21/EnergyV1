'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function ReorderButtons({ projectId, isFirst, isLast }: {
  projectId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [moving, setMoving] = useState<'up' | 'down' | null>(null);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  const move = useCallback(async (direction: 'up' | 'down') => {
    if (moving) return; // prevent duplicate clicks
    setMoving(direction);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/projects/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, direction }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(data.error || 'Reorder failed');
      }
      setFeedback('success');
      router.refresh();
    } catch (err: any) {
      console.error('Reorder error:', err.message);
      setFeedback('error');
    } finally {
      setMoving(null);
      setTimeout(() => setFeedback(null), 1500);
    }
  }, [projectId, moving, router]);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => move('up')}
        disabled={isFirst || moving !== null}
        title={isFirst ? 'Already first' : 'Move up'}
        className={`text-[10px] p-0.5 leading-none rounded transition ${
          isFirst ? 'text-gray-300 cursor-default' :
          feedback === 'error' ? 'text-red-400' :
          moving === 'up' ? 'text-primary animate-pulse' :
          'text-muted hover:text-primary'
        }`}
      >
        {moving === 'up' ? '●' : '▲'}
      </button>
      <button
        onClick={() => move('down')}
        disabled={isLast || moving !== null}
        title={isLast ? 'Already last' : 'Move down'}
        className={`text-[10px] p-0.5 leading-none rounded transition ${
          isLast ? 'text-gray-300 cursor-default' :
          feedback === 'error' ? 'text-red-400' :
          moving === 'down' ? 'text-primary animate-pulse' :
          'text-muted hover:text-primary'
        }`}
      >
        {moving === 'down' ? '●' : '▼'}
      </button>
    </div>
  );
}
