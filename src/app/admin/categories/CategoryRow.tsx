'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCategory, deleteCategory, toggleCategoryVisibility } from './actions';
import { ReorderButtons } from '@/components/admin/ReorderButtons';

interface CategoryRowProps {
  category: any;
  allCategories: any[];
  usageCount: number;
  isFirst: boolean;
  isLast: boolean;
}

export function CategoryRow({ category, allCategories, usageCount, isFirst, isLast }: CategoryRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [parentId, setParentId] = useState(category.parentId || '');
  const [color, setColor] = useState(category.color || '');
  const [showGradient, setShowGradient] = useState(!!category.showGradient);
  const [gradientColor, setGradientColor] = useState(category.gradientColor || '#FFFFFF');
  const [gradientHeight, setGradientHeight] = useState(category.gradientHeight ?? 48);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toggling, setToggling] = useState(false);
  const router = useRouter();

  const isChild = !!category.parentId;
  const parentOptions = allCategories.filter((c: any) => c.id !== category.id && !c.parentId);

  // Visibility state
  const ownVisible = category.isVisible ?? true;
  const effectiveVisible = category.effectiveVisible ?? true;
  const hiddenByAncestor = ownVisible && !effectiveVisible;

  async function handleToggleVisibility() {
    if (toggling) return;
    setToggling(true);
    await toggleCategoryVisibility(category.id, !ownVisible);
    setToggling(false);
    router.refresh();
  }

  async function handleSave() {
    if (!name || !slug) return;
    setSaving(true);
    await updateCategory(category.id, {
      name,
      slug,
      parentId: parentId || null,
      ...(isChild ? {} : {
        color: color || null,
        showGradient,
        gradientColor: gradientColor || null,
        gradientHeight: showGradient ? gradientHeight : null,
      }),
    });
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
    <div className={`flex items-center justify-between border-b px-4 py-3 text-sm ${isChild ? 'bg-surface border-gray-50' : ''} ${!effectiveVisible ? 'opacity-60' : ''}`}>
      {editing ? (
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-40 rounded border px-2 py-1 text-sm" required />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-40 rounded border px-2 py-1 text-sm" required />
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className="rounded border px-2 py-1 text-sm">
            <option value="">Top Level</option>
            {parentOptions.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {!isChild && (
            <>
              <label className="flex items-center gap-1 text-xs text-muted">
                Warna
                <input type="color" value={color || '#000000'} onChange={(e) => setColor(e.target.value)} className="h-6 w-8 rounded border" />
              </label>
              <label className="flex items-center gap-1 text-xs text-muted">
                <input type="checkbox" checked={showGradient} onChange={(e) => setShowGradient(e.target.checked)} />
                Gradient
              </label>
              {showGradient && (
                <>
                  <label className="flex items-center gap-1 text-xs text-muted">
                    Warna
                    <input type="color" value={gradientColor} onChange={(e) => setGradientColor(e.target.value)} className="h-6 w-8 rounded border" />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-muted">
                    Tinggi
                    <input type="number" min={0} value={gradientHeight} onChange={(e) => setGradientHeight(Number(e.target.value))} className="w-16 rounded border px-2 py-1 text-sm" />
                  </label>
                </>
              )}
            </>
          )}

          <button onClick={handleSave} disabled={saving} className="rounded bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button onClick={() => setEditing(false)} className="rounded border px-3 py-1 text-xs text-muted hover:bg-surface">Batal</button>
        </div>
      ) : (
        <>
          <ReorderButtons
            id={category.id}
            isFirst={isFirst}
            isLast={isLast}
            apiPath="/api/admin/categories/reorder"
          />
          {!isChild && (
            <span
              className="inline-block h-4 w-4 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: category.color || 'transparent' }}
              title={category.color ? `Color ${category.color}` : 'No color'}
            />
          )}
          <span className={isChild ? 'pl-6 text-primary' : 'font-semibold text-primary'}>
            {isChild ? `└ ${category.name}` : category.name}
          </span>
          <span className="text-muted text-xs">{category.slug}</span>
          <span className="text-xs text-muted min-w-[80px] text-right">
            {usageCount} Produk
          </span>
          {!isChild && (
            <span className="text-muted text-xs">
              {category.showGradient ? `grad ${category.gradientColor ?? '#fff'} ${category.gradientHeight ?? 48}px` : ''}{category.children?.length ? `${category.showGradient ? ' · ' : ''}${category.children.length} sub` : ''}
            </span>
          )}

          {/* Visibility toggle */}
          <div className="flex items-center gap-1.5">
            {hiddenByAncestor && (
              <span className="text-[10px] text-amber-600 font-medium" title="Hidden because a parent category is hidden">
                parent hidden
              </span>
            )}
            <button
              onClick={handleToggleVisibility}
              disabled={toggling || hiddenByAncestor}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                ownVisible ? 'bg-green-500' : 'bg-gray-300'
              } ${hiddenByAncestor ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              title={hiddenByAncestor ? 'Hidden by parent — unhide parent first' : ownVisible ? 'Visible — click to hide' : 'Hidden — click to show'}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                  ownVisible ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
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
