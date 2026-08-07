'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCategory, deleteCategory } from './actions';

interface CategoryRowProps {
  category: any;
  allCategories: any[];
  usageCount: number;
}

export function CategoryRow({ category, allCategories, usageCount }: CategoryRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [parentId, setParentId] = useState(category.parentId || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();

  const isChild = !!category.parentId;
  const parentOptions = allCategories.filter((c: any) => c.id !== category.id && !c.parentId);

  async function handleSave() {
    if (!name || !slug) return;
    setSaving(true);
    await updateCategory(category.id, { name, slug, parentId: parentId || null });
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  function handleDeleteClick() {
    setDeleteError(null);
    if (usageCount > 0) {
      setDeleteError(
        `Cannot delete. This category is used by ${usageCount} product${usageCount > 1 ? 's' : ''}. Remove or reassign references first.`
      );
      return;
    }
    setShowDeleteConfirm(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteCategory(category.id);
      router.refresh();
    } catch (e: any) {
      setDeleteError(e?.message || 'Delete failed');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className={`flex items-center justify-between border-b px-4 py-3 text-sm ${isChild ? 'bg-surface border-gray-50' : ''}`}>
      {editing ? (
        <div className="flex flex-1 items-center gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-40 rounded border px-2 py-1 text-sm" required />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-40 rounded border px-2 py-1 text-sm" required />
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="rounded border px-2 py-1 text-sm">
            <option value="">Top Level</option>
            {parentOptions.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving} className="rounded bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={() => setEditing(false)} className="rounded border px-3 py-1 text-xs text-muted hover:bg-surface">Batal</button>
        </div>
      ) : (
        <>
          <span className={isChild ? 'pl-6 text-primary' : 'font-semibold text-primary'}>
            {isChild ? `└ ${category.name}` : category.name}
          </span>
          <span className="text-muted text-xs">{category.slug}</span>
          <span className="text-xs text-muted min-w-[80px] text-right">
            {usageCount} Produk
          </span>
          {!isChild && (
            <span className="text-muted text-xs">{category.children?.length || 0} sub</span>
          )}
        </>
      )}

      {!editing && (
        <div className="flex items-center gap-2">
          {deleteError && (
            <span className="text-xs text-red-600 max-w-[300px]">{deleteError}</span>
          )}
          {showDeleteConfirm ? (
            <span className="inline-flex items-center gap-2">
              <span className="text-xs text-muted">Yakin hapus?</span>
              <button onClick={confirmDelete} disabled={deleting} className="rounded bg-red-600 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? '...' : 'Ya'}
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleting} className="rounded bg-gray-200 px-2 py-0.5 text-xs font-medium text-primary hover:bg-gray-300">
                Batal
              </button>
            </span>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="rounded border px-2 py-1 text-xs text-muted hover:bg-surface">Edit</button>
              <button onClick={handleDeleteClick} disabled={deleting} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50">
                {deleting ? '...' : 'Hapus'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
