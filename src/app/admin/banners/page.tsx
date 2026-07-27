export const dynamic = "force-dynamic";

import { getBanners, createBanner, updateBanner, deleteBanner } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';
import { ImageUpload } from '../ImageUpload';

export default async function BannersPage() {
  const banners = await getBanners();

  async function handleCreate(data: FormData) {
    'use server';
    await createBanner({ id: `banner-${Date.now()}`, type: data.get('type'), title: data.get('title'), image: data.get('image'), link: data.get('link'), alt: data.get('alt'), sortOrder: parseInt(data.get('sortOrder') as string) || 0 });
    revalidatePath('/admin/banners');
    revalidatePath('/');
  }

  async function handleUpdate(id: string, data: FormData) {
    'use server';
    await updateBanner(id, { title: data.get('title'), image: data.get('image'), link: data.get('link'), alt: data.get('alt') });
    revalidatePath('/admin/banners');
    revalidatePath('/');
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteBanner(id);
    revalidatePath('/admin/banners');
    revalidatePath('/');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Banner</h1>
      <form action={handleCreate} className="mt-4 space-y-3 rounded-xl border bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="title" placeholder="Judul" required className="rounded-lg border px-3 py-2 text-sm" />
          <select name="type" className="rounded-lg border px-3 py-2 text-sm" defaultValue="hero">
            <option value="hero">Hero</option>
            <option value="need-card">Need Card</option>
          </select>
          <ImageUpload name="image" label="Gambar Banner" />
          <input name="link" placeholder="Link" className="rounded-lg border px-3 py-2 text-sm" />
          <input name="alt" placeholder="Alt text" className="rounded-lg border px-3 py-2 text-sm" />
          <input name="sortOrder" type="number" placeholder="Urutan" className="rounded-lg border px-3 py-2 text-sm" />
        </div>
        <SubmitButton label="Tambah Banner" />
      </form>
      <div className="mt-4 space-y-3">
        {banners.map((b: any) => (
          <div key={b.id} className="rounded-xl border bg-white p-4">
            <form action={handleUpdate.bind(null, b.id)} className="grid gap-3 sm:grid-cols-2">
              <input name="title" defaultValue={b.title} className="rounded-lg border px-3 py-2 text-sm" />
              <span className="text-sm text-gray-400">{b.type}</span>
              <ImageUpload name="image" label="Gambar Banner" defaultValue={b.image || ''} />
              <input name="link" defaultValue={b.link} className="rounded-lg border px-3 py-2 text-sm" />
              <input name="alt" defaultValue={b.alt} className="rounded-lg border px-3 py-2 text-sm" />
              <div className="flex justify-end gap-2">
                <SubmitButton label="Simpan" loadingLabel="Menyimpan..." className="rounded-lg bg-gray-800 px-3 py-1 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50" />
                <DeleteButton itemName={b.title} onDelete={handleDelete.bind(null, b.id)} />
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
