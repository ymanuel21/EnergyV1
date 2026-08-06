'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@ui/Button';

type CopyStatus = 'idle' | 'success' | 'error';

export function ClipboardCopyButton() {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('success');

      // Auto-reset after 2.5 seconds
      timerRef.current = setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');

      // Auto-reset after 3 seconds
      timerRef.current = setTimeout(() => setStatus('idle'), 3000);
    }
  }, []);

  const isIdle = status === 'idle';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <Button
      variant={isSuccess ? 'primary' : 'ghost'}
      size="sm"
      onClick={handleCopy}
      disabled={!isIdle}
      className="hover:bg-black hover:text-white"
    >
      {isIdle && 'Salin Link'}
      {isSuccess && '✓ Tersalin'}
      {isError && '⚠ Gagal menyalin'}
    </Button>
  );
}
