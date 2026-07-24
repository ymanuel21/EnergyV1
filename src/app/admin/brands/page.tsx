export const dynamic = "force-dynamic";

import { getBrands, createBrand, deleteBrand } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';
import { SlugInput } from '../SlugInput';

export default async function BrandsPage() {
  const brands = await getBrands();

  async function handleCreate(data: FormData) {
    'use server';
    await createBrand({ name: data.get('name'), slug: data.get('slug') });
    revalidatePath('/admin/brands');
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteBrand(id);
    revalidatePath('/admin/brands');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Brand</h1>
      <form action={handleCreate} className="mt-4 flex gap-3 items-end">
        <input name="name" placeholder="Nama brand" required className="flex-1 rounded-lg border px-3 py-2 text-sm" />
        <SlugInput name="slug" sourceName="name" />
        <SubmitButton label="Tambah" />
      </form>
      <div className="mt-4 rounded-xl border bg-white">
        {brands.map((b: any) => (
          <div key={b.id} className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0">
            <span className="font-medium">{b.name}</span>
            <span className="text-gray-400">{b.slug}</span>
            <DeleteButton itemName={b.name} onDelete={handleDelete.bind(null, b.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
