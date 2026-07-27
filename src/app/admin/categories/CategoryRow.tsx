'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCategory, deleteCategory } from './actions';

export function CategoryRow({ category, allCategories }: { category: any; allCategories: any[] }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [parentId, setParentId] = useState(category.parentId || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  async function handleDelete() {
    if (!confirm(`Yakin hapus kategori "${category.name}"?`)) return;
    setDeleting(true);
    await deleteCategory(category.id);
    router.refresh();
  }

  return (
    <div className={`flex items-center justify-between border-b px-4 py-3 text-sm ${isChild ? 'bg-gray-50 border-gray-50' : ''}`}>
      {editing ? (
        <div className="flex flex-1 items-center gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-40 rounded border px-2 py-1 text-sm"
            required
          />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-40 rounded border px-2 py-1 text-sm"
            required
          />
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="">Top Level</option>
            {parentOptions.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="rounded border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      ) : (
        <>
          <span className={isChild ? 'pl-6 text-gray-700' : 'font-semibold text-gray-900'}>
            {isChild ? `└ ${category.name}` : category.name}
          </span>
          <span className="text-gray-400 text-xs">{category.slug}</span>
          {!isChild && (
            <span className="text-gray-400 text-xs">{category.children?.length || 0} sub</span>
          )}
        </>
      )}

      {!editing && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded border px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? '...' : 'Hapus'}
          </button>
        </div>
      )}
    </div>
  );
}
