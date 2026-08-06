'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@lib/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

/* ══════════════════════════════════════════════
   Button — reusable interaction feedback system
   States: default | hover | pressed | focused |
           disabled | loading | success | error
   ══════════════════════════════════════════════ */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm',
        outline: 'border border-primary text-primary hover:bg-surface',
        ghost: 'text-muted hover:text-primary hover:bg-surface',
        whatsapp: 'bg-green-500 text-white hover:bg-green-600 shadow-sm',
        link: 'text-primary underline-offset-4 hover:underline',
        danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        success: 'bg-green-600 text-white shadow-sm',
        error: 'bg-red-600 text-white shadow-sm',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  successDuration?: number;
}

export function Button({
  className, variant, size, isLoading, loadingText, leftIcon, rightIcon, children, disabled, onClick, successDuration = 2000, ...props
}: ButtonProps) {
  const [feedbackState, setFeedbackState] = useState<'idle' | 'success' | 'error'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick || disabled || isLoading) return;
    try {
      await onClick(e);
      setFeedbackState('success');
      timerRef.current = setTimeout(() => setFeedbackState('idle'), successDuration);
    } catch {
      setFeedbackState('error');
      timerRef.current = setTimeout(() => setFeedbackState('idle'), successDuration);
    }
  }, [onClick, disabled, isLoading, successDuration]);

  const isBusy = isLoading || feedbackState === 'success' || feedbackState === 'error';
  const displayVariant = feedbackState === 'success' ? 'success' : feedbackState === 'error' ? 'error' : variant;

  return (
    <button
      className={cn(buttonVariants({ variant: displayVariant, size, className }))}
      disabled={disabled || isBusy}
      onClick={handleClick}
      {...props}
    >
      {isLoading ? (
        <>
          <SpinnerIcon />
          {loadingText || children}
        </>
      ) : feedbackState === 'success' ? (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          {children}
        </>
      ) : feedbackState === 'error' ? (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          {children}
        </>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {/* Only render children bare when idle (success/error states already render them with icons) */}
      {!isLoading && feedbackState === 'idle' && children}
      {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
}

export { buttonVariants };

/* ── Spinner ── */
function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
