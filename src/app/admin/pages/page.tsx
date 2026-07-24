export const dynamic = "force-dynamic";

import { getPages, getPageBySlug, updatePage } from './actions';
import { revalidatePath } from 'next/cache';
import { SubmitButton } from '../SubmitButton';

export default async function PagesPage() {
  const pages = await getPages();

  async function update(slug: string, data: FormData) {
    'use server';
    const existing = await getPageBySlug(slug);
    if (existing) {
      await updatePage(slug, { title: data.get('title'), content: data.get('content') });
    }
    revalidatePath('/admin/pages');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Halaman Statis</h1>
      <div className="mt-4 space-y-4">
        {pages.map((p: any) => (
          <div key={p.slug} className="rounded-xl border bg-white p-4">
            <form action={update.bind(null, p.slug)} className="space-y-3">
              <input name="title" defaultValue={p.title} className="w-full rounded-lg border px-3 py-2 text-sm font-medium" />
              <textarea name="content" defaultValue={p.content} rows={10} className="w-full rounded-lg border px-3 py-2 text-sm font-mono" />
              <div className="flex justify-end">
                <SubmitButton label="Simpan" loadingLabel="Menyimpan..." className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50" />
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
