'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface NotificationBadgeProps {
  className?: string;
  showTextLabel?: boolean;
}

export function NotificationBadge({ className = '', showTextLabel = true }: NotificationBadgeProps) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);

  const fetchCount = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.pendingQuotes === 'number') {
          setCount(data.pendingQuotes);
          setHasError(false);
        }
      } else {
        console.error('Failed to fetch admin notifications:', res.status, res.statusText);
        setHasError(true);
      }
    } catch (err) {
      console.error('Error fetching admin notifications:', err);
      setHasError(true);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchCount();

    const intervalId = setInterval(() => {
      fetchCount();
    }, 30000); // 30s lightweight polling

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchCount]);

  const displayBadge = count !== null && count > 0;
  const badgeText = count !== null ? (count > 99 ? '99+' : count.toString()) : '';

  const ariaLabel = loading && count === null
    ? 'Loading quote notifications'
    : count === null
    ? 'Quote notifications status unavailable'
    : `${count} pending quote notification${count === 1 ? '' : 's'}`;

  return (
    <Link
      href="/admin/quotes"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
    >
      <div className="relative inline-flex items-center">
        <span className="text-base leading-none" role="img" aria-hidden="true">
          🔔
        </span>
        {loading && count === null && (
          <span className="ml-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-muted/40" />
        )}
        {displayBadge && (
          <span className="ml-1.5 inline-flex items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-xs">
            {badgeText}
          </span>
        )}
      </div>

      {showTextLabel && (
        <span className="text-sm font-medium text-primary">
          Notifications
        </span>
      )}
    </Link>
  );
}
