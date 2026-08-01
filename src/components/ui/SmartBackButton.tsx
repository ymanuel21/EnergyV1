'use client';

import { useRouter } from 'next/navigation';

interface SmartBackButtonProps {
  fallbackRoute: string;
  label?: string;
  className?: string;
}

export function SmartBackButton({ fallbackRoute, label, className = '' }: SmartBackButtonProps) {
  const router = useRouter();

  function handleBack() {
    // If there is a previous page in browser history, go back to it.
    // This preserves filters, search, pagination, and the actual previous route.
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackRoute);
    }
  }

  const displayLabel = label || `← Kembali`;

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors ${className}`}
      aria-label="Kembali ke halaman sebelumnya"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {displayLabel}
    </button>
  );
}
