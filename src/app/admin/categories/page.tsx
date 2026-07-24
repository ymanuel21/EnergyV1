export const dynamic = "force-dynamic";

import { getCategories, createCategory, updateCategory, deleteCategory } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';
import { SlugInput } from '../SlugInput';

export default async function CategoriesPage() {
  const categories = await getCategories();

  async function handleCreate(data: FormData) {
    'use server';
    await createCategory({ name: data.get('name'), slug: data.get('slug'), sortOrder: 0 });
    revalidatePath('/admin/categories');
  }

  async function handleUpdate(id: string, data: FormData) {
    'use server';
    await updateCategory(id, { name: data.get('name'), slug: data.get('slug') });
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
      <form action={handleCreate} className="mt-4 flex gap-3 items-end">
        <input name="name" placeholder="Nama kategori" required className="flex-1 rounded-lg border px-3 py-2 text-sm" />
        <SlugInput name="slug" sourceName="name" />
        <SubmitButton label="Tambah" />
      </form>
      <div className="mt-4 rounded-xl border bg-white">
        {categories.map((c: any) => (
          <div key={c.id} className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0">
            <span className="font-medium">{c.name}</span>
            <span className="text-gray-400">{c.slug}</span>
            <DeleteButton itemName={c.name} onDelete={handleDelete.bind(null, c.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
