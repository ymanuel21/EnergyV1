export const dynamic = "force-dynamic";

import Link from 'next/link';
import { getBrands, createBrand, deleteBrand } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';
import { SlugInput } from '../SlugInput';
import { ImageUpload } from '../ImageUpload';
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
      <h1 className="text-2xl font-bold text-primary">Brand</h1>
      <form action={handleCreate} className="mt-4 grid gap-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-muted mb-1">Nama Brand</label>
            <input name="name" placeholder="Nama brand" required className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="w-48">
            <label className="block text-xs font-medium text-muted mb-1">Slug</label>
            <SlugInput name="slug" sourceName="name" className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <SubmitButton label="Tambah" />
        </div>
        <ImageUpload name="logo" label="Logo Brand (opsional)" />
      </form>
      <div className="mt-4 rounded-xl border bg-card">
        {brands.map((b: any) => (
          <div key={b.id} className="flex items-center justify-between border-b px-4 py-3 text-sm last:border-0 gap-3">
            <BrandLogo name={b.name} logo={b.logo} size="sm" />
            <span className="font-medium flex-1">{b.name}</span>
            <span className="text-muted hidden sm:inline">{b.slug}</span>
            <Link href={`/admin/brands/${b.id}`} className="text-gray-800 hover:text-gray-800 font-medium text-sm">
              Edit
            </Link>
            <DeleteButton itemName={b.name} onDelete={handleDelete.bind(null, b.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
