'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteBrand } from './actions';

export function DeleteBrandButton({ id, name, usageCount }: { id: string; name: string; usageCount: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setError(null);
    if (usageCount > 0) {
      setError(`Cannot delete. This brand is used by ${usageCount} product${usageCount > 1 ? 's' : ''}. Remove or reassign references first.`);
      return;
    }
    if (!confirm(`Yakin hapus brand "${name}"?`)) return;
    setDeleting(true);
    try {
      await deleteBrand(id);
      router.push('/admin/brands');
      router.refresh();
    } catch (e: any) {
      setError(e?.message || 'Delete failed');
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2 max-w-sm">{error}</p>
      )}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? 'Menghapus...' : 'Hapus Brand'}
      </button>
    </div>
  );
}
