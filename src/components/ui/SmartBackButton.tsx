'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SmartBackButtonProps {
  fallbackRoute: string;
  label?: string;
  className?: string;
}

const HISTORY_KEY = 'ebtplaza-prev-page';

/**
 * Store the current page URL. Call this from any page that should
 * be returned to via the Smart Back Button.
 */
export function TrackPageForBack() {
  if (typeof window === 'undefined') return null;
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    try {
      sessionStorage.setItem(HISTORY_KEY, window.location.pathname + window.location.search);
    } catch {}
  }, []);
  return null;
}

export function SmartBackButton({ fallbackRoute, label, className = '' }: SmartBackButtonProps) {
  const router = useRouter();
  const [storedPath, setStoredPath] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      if (raw) setStoredPath(raw);
    } catch {}
  }, []);

  const handleBack = () => {
    if (storedPath) {
      // Navigate to the exact stored URL, then clear it
      try { sessionStorage.removeItem(HISTORY_KEY); } catch {}
      router.push(storedPath);
    } else if (typeof document !== 'undefined' && document.referrer) {
      // Check if referrer is from our own site
      const referrerHost = new URL(document.referrer).host;
      const ourHost = window.location.host;
      if (referrerHost === ourHost) {
        router.back();
      } else {
        router.push(fallbackRoute);
      }
    } else {
      router.push(fallbackRoute);
    }
  };

  const displayLabel = label || (storedPath ? '← Kembali' : `← Kembali ke ${fallbackRoute.replace(/^\//, '').replace(/^\w/, c => c.toUpperCase())}`);

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors ${className}`}
      aria-label={storedPath ? 'Kembali ke halaman sebelumnya' : `Kembali ke ${fallbackRoute}`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {displayLabel}
    </button>
  );
}
