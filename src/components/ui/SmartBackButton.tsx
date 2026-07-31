'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface SmartBackButtonProps {
  fallbackRoute: string;
  /** Scope key — e.g. 'products', 'projects', 'blog'. Prevents cross-section collisions. */
  scope: string;
  label?: string;
  className?: string;
}

const KEY_PREFIX = 'ebtplaza-back:';

/** Store the current page for a given scope. Call from listing pages. */
export function TrackPageForBack({ scope }: { scope: string }) {
  if (typeof window === 'undefined') return null;
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    try {
      sessionStorage.setItem(KEY_PREFIX + scope, window.location.pathname + window.location.search);
    } catch {}
  }, [scope]);
  return null;
}

export function SmartBackButton({ fallbackRoute, scope, label, className = '' }: SmartBackButtonProps) {
  const router = useRouter();
  const [storedPath, setStoredPath] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY_PREFIX + scope);
      if (raw) setStoredPath(raw);
    } catch {}
  }, [scope]);

  function handleBack() {
    if (storedPath) {
      router.push(storedPath);
      // Keep history — don't clear. Next listing visit will overwrite.
    } else if (typeof document !== 'undefined' && document.referrer) {
      try {
        const referrerHost = new URL(document.referrer).host;
        if (referrerHost === window.location.host) {
          router.back();
          return;
        }
      } catch {}
      router.push(fallbackRoute);
    } else {
      router.push(fallbackRoute);
    }
  }

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
