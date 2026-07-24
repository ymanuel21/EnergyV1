'use client';

import { useEffect, useCallback } from 'react';
import { cn } from '@lib/utils/cn';
import { CloseIcon } from './Icons';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  showCloseButton = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full rounded-2xl bg-white p-6 shadow-xl animate-scale-in',
          sizeClasses[size]
        )}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Tutup"
          >
            <CloseIcon />
          </button>
        )}
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
