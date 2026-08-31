'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../AdminToastProvider';
import { deleteProduct } from './actions';

/**
 * Product delete with confirmation + clear success/error feedback.
 * Reuses the existing `deleteProduct` server action and the shared `AdminToastProvider`
 * (the same feedback system used by DeleteButton). On success it toasts and redirects
 * to /admin/products; on failure it toasts an error and stays on the page.
 */
export function ProductDeleteButton({ id, productName }: { id: string; productName?: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteProduct(id);
        showToast('✓ Produk berhasil dihapus', 'success');
        router.push('/admin/products');
        router.refresh();
      } catch {
        showToast('✕ Gagal menghapus produk', 'error');
        setShowConfirm(false);
      }
    });
  }

  if (showConfirm) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-muted">
          {productName ? `Hapus "${productName}"?` : 'Yakin hapus produk?'}
        </span>
        <button
          onClick={handleConfirm}
          disabled={isPending}
          className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? '...' : 'Ya'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="rounded bg-gray-200 px-3 py-1.5 text-xs font-medium text-primary hover:bg-gray-300"
        >
          Batal
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
    >
      Hapus
    </button>
  );
}
