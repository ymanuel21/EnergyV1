'use client';

import { useTransition } from 'react';
import { useToast } from '@/app/admin/AdminToastProvider';

interface ActionButtonProps {
  label: string;
  loadingLabel?: string;
  successMessage?: string;
  onClick: () => Promise<{ success: boolean; message?: string } | void>;
  variant?: 'primary' | 'danger' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export function ActionButton({
  label,
  loadingLabel = 'Menyimpan...',
  successMessage = 'Berhasil disimpan',
  onClick,
  variant = 'primary',
  className = '',
  disabled,
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const variants = {
    primary: 'bg-gray-800 text-white hover:bg-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
  };

  const handleClick = () => {
    startTransition(async () => {
      try {
        const result = await onClick();
        if (result?.success === false) {
          showToast(result.message || 'Gagal', 'error');
        } else {
          showToast(successMessage, 'success');
        }
      } catch {
        showToast('Terjadi kesalahan', 'error');
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending || disabled}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {isPending ? loadingLabel : label}
    </button>
  );
}
