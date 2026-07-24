'use client';

import { useState, useTransition } from 'react';

interface DeleteButtonProps {
  label?: string;
  confirmText?: string;
  itemName?: string;
  /** Server action bound with the item ID */
  onDelete: () => Promise<void>;
}

export function DeleteButton({ label = 'Hapus', confirmText, itemName, onDelete }: DeleteButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await onDelete();
      setShowConfirm(false);
    });
  }

  if (showConfirm) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-gray-500">
          {confirmText ?? (itemName ? `Hapus "${itemName}"?` : 'Yakin hapus?')}
        </span>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? '...' : 'Ya'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-300"
        >
          Batal
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-500 hover:underline text-xs"
      type="button"
    >
      {label}
    </button>
  );
}
