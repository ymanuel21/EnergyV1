'use client';

import { useState, useCallback } from 'react';

export function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
    }
  }, [id]);

  return (
    <button
      onClick={copy}
      title="Copy full ID"
      className="text-[10px] text-muted hover:text-primary opacity-0 group-hover:opacity-100 transition"
    >
      {copied ? '✓' : '📋'}
    </button>
  );
}
