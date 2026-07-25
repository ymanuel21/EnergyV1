export const dynamic = "force-dynamic";

import { getCategories, createCategory, deleteCategory } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';
import { SlugInput } from '../SlugInput';

export default async function CategoriesPage() {
  const allCategories = await getCategories();

  // Build tree: top-level categories sorted
  const topLevel = allCategories.filter((c: any) => !c.parentId);

  async function handleCreate(data: FormData) {
    'use server';
    const name = data.get('name') as string;
    const slug = data.get('slug') as string;
    const parentId = data.get('parentId') as string;
    if (!name || !slug) return;
    await createCategory({ name, slug, sortOrder: 0, parentId: parentId || null });
    revalidatePath('/admin/categories');
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteCategory(id);
    revalidatePath('/admin/categories');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>

      {/* Create form */}
      <form action={handleCreate} className="mt-4 flex gap-3 items-end">
        <input name="name" placeholder="Nama kategori" required className="flex-1 rounded-lg border px-3 py-2 text-sm" />
        <SlugInput name="slug" sourceName="name" className="flex-1 rounded-lg border px-3 py-2 text-sm" />
        <select name="parentId" className="rounded-lg border px-3 py-2 text-sm">
          <option value="">None (Top Level)</option>
          {topLevel.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <SubmitButton label="Tambah" />
      </form>

      {/* Tree display */}
      <div className="mt-4 rounded-xl border bg-white">
        {topLevel.map((cat: any) => (
          <div key={cat.id}>
            <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
              <span className="font-semibold text-brand-700">{cat.name}</span>
              <span className="text-gray-400">{cat.slug}</span>
              <span className="text-gray-400 text-xs">{cat.children?.length || 0} sub</span>
              <DeleteButton itemName={cat.name} onDelete={handleDelete.bind(null, cat.id)} />
            </div>
            {/* Children */}
            {cat.children?.map((child: any) => (
              <div key={child.id} className="flex items-center justify-between border-b border-gray-50 bg-gray-50 px-4 py-2.5 text-sm">
                <span className="pl-6 text-gray-700">└ {child.name}</span>
                <span className="text-gray-400 text-xs">{child.slug}</span>
                <DeleteButton itemName={child.name} onDelete={handleDelete.bind(null, child.id)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
