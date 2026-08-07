export const dynamic = "force-dynamic";

import { getCategories, createCategory, getCategoryUsage } from './actions';
import { revalidatePath } from 'next/cache';
import { SubmitButton } from '../SubmitButton';
import { SlugInput } from '../SlugInput';
import { CategoryRow } from './CategoryRow';

export default async function CategoriesPage() {
  const allCategories = await getCategories();
  const topLevel = allCategories.filter((c: any) => !c.parentId);

  // Preload usage counts
  const usageMap = new Map<string, number>();
  await Promise.all(
    allCategories.map(async (c: any) => {
      const { productCount } = await getCategoryUsage(c.id);
      usageMap.set(c.id, productCount);
    })
  );

  async function handleCreate(data: FormData) {
    'use server';
    const name = data.get('name') as string;
    const slug = data.get('slug') as string;
    const parentId = data.get('parentId') as string;
    if (!name || !slug) return;
    await createCategory({ name, slug, parentId: parentId || null });
    revalidatePath('/admin/categories');
    revalidatePath('/kategori');
    revalidatePath('/produk');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Kategori</h1>

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

      <div className="mt-4 rounded-xl border bg-card">
        {topLevel.map((cat: any) => (
          <div key={cat.id}>
            <CategoryRow
              category={cat}
              allCategories={allCategories}
              usageCount={usageMap.get(cat.id) || 0}
            />
            {cat.children?.map((child: any) => (
              <CategoryRow
                key={child.id}
                category={child}
                allCategories={allCategories}
                usageCount={usageMap.get(child.id) || 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
