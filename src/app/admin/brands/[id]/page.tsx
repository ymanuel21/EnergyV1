export const dynamic = "force-dynamic";

import { notFound, redirect } from 'next/navigation';
import { getBrand, updateBrand } from '../actions';
import { revalidatePath } from 'next/cache';
import { SubmitButton } from '../../SubmitButton';
import { SlugInput } from '../../SlugInput';
import { ImageUpload } from '../../ImageUpload';
import { BrandLogo } from '@ui/BrandLogo';
import { DeleteBrandButton } from '../DeleteBrandButton';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params;
  const brand = await getBrand(id);
  if (!brand) notFound();

  async function handleUpdate(data: FormData) {
    'use server';
    const name = data.get('name')?.toString();
    const slug = data.get('slug')?.toString();
    const logo = data.get('logo')?.toString() || null;
    if (!name || !slug) return;
    await updateBrand(id, { name, slug, logo });
    revalidatePath('/admin/brands');
    redirect('/admin/brands');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>

      <form action={handleUpdate} className="mt-6 space-y-6">
        {/* Current logo preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo Saat Ini</label>
          <BrandLogo name={brand.name} logo={brand.logo} size="lg" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Brand *</label>
            <input
              name="name"
              defaultValue={brand.name}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <SlugInput
              name="slug"
              defaultValue={brand.slug}
              sourceName="name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <ImageUpload
          name="logo"
          label="Upload Logo Baru"
          defaultValue={brand.logo || '/images/placeholder/product-placeholder.png'}
        />

        <div className="flex gap-3">
          <SubmitButton label="Simpan" />
          <a
            href="/admin/brands"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </a>
        </div>
      </form>

      {/* Delete */}
      <div className="mt-8 border-t pt-6">
        <DeleteBrandButton id={id} name={brand.name} />
      </div>
    </div>
  );
}
