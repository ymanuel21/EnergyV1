'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SmartBackButtonProps {
  fallbackRoute: string;
  label?: string;
  className?: string;
}

const HISTORY_KEY = 'ebtplaza-nav-history';

// Store current page as a listing page (called from listing pages)
export function useStoreListingHistory() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const entry = { path: pathname + window.location.search, ts: Date.now() };
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(entry));
    } catch {}
  }, [pathname]);
}

export function SmartBackButton({ fallbackRoute, label, className = '' }: SmartBackButtonProps) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);
  const [historyLabel, setHistoryLabel] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      if (raw) {
        const entry = JSON.parse(raw);
        // Valid if stored within last 30 minutes
        if (Date.now() - entry.ts < 30 * 60 * 1000) {
          setHasHistory(true);
          setHistoryLabel(entry.path);
          return;
        }
      }
    } catch {}
    setHasHistory(false);
  }, []);

  const handleBack = () => {
    if (hasHistory) {
      router.back();
    } else {
      router.push(fallbackRoute);
    }
  };

  const displayLabel = label || (hasHistory ? '← Kembali' : `← Kembali ke ${fallbackRoute.replace('/', '').replace(/^\w/, c => c.toUpperCase())}`);

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors ${className}`}
      aria-label={hasHistory ? 'Kembali ke halaman sebelumnya' : `Kembali ke ${fallbackRoute}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {displayLabel}
    </button>
  );
}
