export const dynamic = "force-dynamic";

import { getCategories, createCategory, getCategoryUsage } from './actions';
import { revalidatePath } from 'next/cache';
import { SubmitButton } from '../SubmitButton';
import { SlugInput } from '../SlugInput';
import { CategoryRow } from './CategoryRow';

export default async function CategoriesPage() {
  const ordered = await getCategories();
  const parents = ordered.filter((c: any) => !c.parentId);
  const topLevel = parents;

  // Preload usage counts
  const usageMap = new Map<string, number>();
  await Promise.all(
    ordered.map(async (c: any) => {
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
        {parents.map((parent: any, i: number) => (
          <div key={parent.id}>
            <CategoryRow
              category={parent}
              allCategories={ordered}
              usageCount={usageMap.get(parent.id) || 0}
              isFirst={i === 0}
              isLast={i === parents.length - 1}
            />
            {(parent.children ?? []).map((child: any, j: number) => (
              <CategoryRow
                key={child.id}
                category={child}
                allCategories={ordered}
                usageCount={usageMap.get(child.id) || 0}
                isFirst={j === 0}
                isLast={j === (parent.children ?? []).length - 1}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
