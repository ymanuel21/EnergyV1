'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export function SubmitButton({
  label = 'Simpan',
  loadingLabel = 'Menyimpan...',
  className = 'rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? loadingLabel : label}
    </button>
  );
}
