export const dynamic = "force-dynamic";

import { getCategories, createCategory } from './actions';
import { revalidatePath } from 'next/cache';
import { SubmitButton } from '../SubmitButton';
import { SlugInput } from '../SlugInput';
import { CategoryRow } from './CategoryRow';

export default async function CategoriesPage() {
  const allCategories = await getCategories();
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

      {/* Category list */}
      <div className="mt-4 rounded-xl border bg-white">
        {topLevel.map((cat: any) => (
          <div key={cat.id}>
            <CategoryRow category={cat} allCategories={allCategories} />
            {cat.children?.map((child: any) => (
              <CategoryRow key={child.id} category={child} allCategories={allCategories} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
