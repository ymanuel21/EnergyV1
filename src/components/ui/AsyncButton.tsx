'use client';

import { useState, useCallback } from 'react';

interface AsyncButtonProps {
  idleText: string;
  loadingText: string;
  onClick: () => Promise<void>;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  successToast?: string;
  onSuccess?: () => void;
}

export function AsyncButton({
  idleText, loadingText, onClick, variant = 'primary', size = 'md',
  className = '', disabled = false, type = 'button', successToast, onSuccess,
}: AsyncButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading || done) return;
    setLoading(true);
    try {
      await onClick();
      setDone(true);
      setTimeout(() => setDone(false), 2000);
      onSuccess?.();
    } catch {
      // caller handles error toast
    } finally {
      setLoading(false);
    }
  }, [loading, done, onClick, onSuccess]);

  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    outline: 'border border-border text-muted hover:bg-surface',
    danger: 'border border-red-200 text-red-500 hover:bg-red-50',
    ghost: 'text-muted hover:text-primary',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  };

  const isBusy = loading || done;
  const label = loading ? loadingText : done ? (successToast || 'Done') : idleText;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isBusy}
      aria-busy={loading}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {label}
    </button>
  );
}
