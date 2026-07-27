export const dynamic = "force-dynamic";

import { getBadges, createBadge, updateBadge, deleteBadge } from './actions';
import { revalidatePath } from 'next/cache';
import { DeleteButton } from '../DeleteButton';
import { SubmitButton } from '../SubmitButton';

export default async function BadgesPage() {
  const badges = await getBadges();

  async function handleCreate(data: FormData) {
    'use server';
    await createBadge({
      slug: (data.get('slug') as string) || (data.get('name') as string).toLowerCase().replace(/\s+/g, '-'),
      name: data.get('name') as string,
      color: (data.get('color') as string) || '#3B82F6',
      bgColor: (data.get('bgColor') as string) || '#EFF6FF',
      icon: (data.get('icon') as string) || undefined,
      sortOrder: parseInt(data.get('sortOrder') as string) || 0,
    });
    revalidatePath('/admin/badges');
  }

  async function handleUpdate(id: string, data: FormData) {
    'use server';
    await updateBadge(id, {
      name: data.get('name') as string,
      color: data.get('color') as string,
      bgColor: data.get('bgColor') as string,
      icon: (data.get('icon') as string) || undefined,
      sortOrder: parseInt(data.get('sortOrder') as string) || 0,
    });
    revalidatePath('/admin/badges');
  }

  async function handleDelete(id: string) {
    'use server';
    await deleteBadge(id);
    revalidatePath('/admin/badges');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Badge</h1>

      {/* Create */}
      <form action={handleCreate} className="mt-4 space-y-3 rounded-xl border bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="name" placeholder="Nama" required className="rounded-lg border px-3 py-2 text-sm" />
          <input name="slug" placeholder="Slug (auto)" className="rounded-lg border px-3 py-2 text-sm" />
          <input name="icon" placeholder="Icon (emoji)" className="rounded-lg border px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <div>
              <label className="text-xs text-gray-500">Text</label>
              <input name="color" type="color" defaultValue="#3B82F6" className="h-9 w-16 rounded border" />
            </div>
            <div>
              <label className="text-xs text-gray-500">BG</label>
              <input name="bgColor" type="color" defaultValue="#EFF6FF" className="h-9 w-16 rounded border" />
            </div>
            <input name="sortOrder" type="number" placeholder="Urutan" className="rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>
        <SubmitButton label="Tambah Badge" />
      </form>

      {/* List */}
      <div className="mt-4 space-y-2">
        {badges.map((b: any) => (
          <div key={b.id} className="rounded-xl border bg-white p-4">
            <form action={handleUpdate.bind(null, b.id)} className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold" style={{ color: b.color, backgroundColor: b.bgColor }}>
                {b.icon && <span>{b.icon}</span>}
                {b.name}
              </span>
              <input name="name" defaultValue={b.name} className="w-24 rounded-lg border px-2 py-1 text-sm" />
              <input name="color" type="color" defaultValue={b.color} className="h-8 w-10 rounded border" />
              <input name="bgColor" type="color" defaultValue={b.bgColor} className="h-8 w-10 rounded border" />
              <input name="icon" defaultValue={b.icon || ''} placeholder="Emoji" className="w-16 rounded-lg border px-2 py-1 text-sm" />
              <input name="sortOrder" type="number" defaultValue={b.sortOrder} className="w-16 rounded-lg border px-2 py-1 text-sm" />
              <SubmitButton label="Simpan" loadingLabel="..." className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700" />
              <DeleteButton itemName={b.name} onDelete={handleDelete.bind(null, b.id)} />
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
