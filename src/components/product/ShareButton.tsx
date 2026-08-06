'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type CopyStatus = 'idle' | 'success' | 'error';

/**
 * Copy page URL to clipboard. Self-contained feedback — does NOT use the
 * shared Button component to avoid double feedback (Button has its own
 * success state that would fire alongside ours).
 */
export function ClipboardCopyButton() {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('success');
      timerRef.current = setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      timerRef.current = setTimeout(() => setStatus('idle'), 3000);
    }
  }, []);

  const isIdle = status === 'idle';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const baseCls =
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-150 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] ' +
    'h-8 px-3';

  const variantCls = isSuccess
    ? 'bg-primary text-white shadow-sm'
    : 'text-muted hover:bg-black hover:text-white';

  return (
    <button
      type="button"
      className={`${baseCls} ${variantCls}`}
      onClick={handleCopy}
      disabled={!isIdle}
    >
      {isIdle && 'Salin Link'}
      {isSuccess && '✓ Tersalin'}
      {isError && '⚠ Gagal menyalin'}
    </button>
  );
}
