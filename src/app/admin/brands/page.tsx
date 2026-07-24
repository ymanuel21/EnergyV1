export const dynamic = "force-dynamic";

import { getBrands, createBrand, deleteBrand } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';
import { SlugInput } from '../SlugInput';
import { BrandLogo } from '@ui/BrandLogo';

export default async function BrandsPage() {
  const brands = await getBrands();

  async function handleCreate(data: FormData) {
    'use server';
    const name = data.get('name');
    const slug = data.get('slug');
    const logo = data.get('logo');
    if (!name || !slug) return;
    await createBrand({
      name: name.toString(),
      slug: slug.toString(),
      logo: logo?.toString() || null,
    });
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
      <form action={handleCreate} className="mt-4 grid gap-3 sm:flex sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Nama Brand</label>
          <input name="name" placeholder="Nama brand" required className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="w-48">
          <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
          <SlugInput name="slug" sourceName="name" className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <div className="w-64">
          <label className="block text-xs font-medium text-gray-600 mb-1">Logo URL (opsional)</label>
          <input name="logo" placeholder="/images/brands/nama.svg" className="w-full rounded-lg border px-3 py-2 text-sm" />
        </div>
        <SubmitButton label="Tambah" />
      </form>
      <div className="mt-4 rounded-xl border bg-white">
        {brands.map((b: any) => (
          <div key={b.id} className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0 gap-3">
            <BrandLogo name={b.name} logo={b.logo} size="sm" />
            <span className="font-medium flex-1">{b.name}</span>
            <span className="text-gray-400 hidden sm:inline">{b.slug}</span>
            <DeleteButton itemName={b.name} onDelete={handleDelete.bind(null, b.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
