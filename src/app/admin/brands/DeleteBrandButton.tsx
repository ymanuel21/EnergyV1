'use client';

import { useRouter } from 'next/navigation';
import { deleteBrand } from './actions';

export function DeleteBrandButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Yakin hapus brand "${name}"?`)) return;
    await deleteBrand(id);
    router.push('/admin/brands');
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
    >
      Hapus Brand
    </button>
  );
}
