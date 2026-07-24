export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation';
import { createArticle } from '../actions';

export default function NewArticlePage() {
  async function handleCreate(data: FormData) {
    'use server';
    await createArticle({
      slug: (data.get('title') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: data.get('title'),
      excerpt: data.get('excerpt'),
      content: data.get('content'),
      author: 'Admin',
      readTime: Math.ceil((data.get('content') as string).split(' ').length / 200),
      isPublished: data.get('publish') === 'on',
    });
    redirect('/admin/articles');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Tulis Artikel</h1>
      <form action={handleCreate} className="mt-6 space-y-4 rounded-xl border bg-white p-6">
        <input name="title" placeholder="Judul artikel" required className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea name="excerpt" placeholder="Ringkasan" rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea name="content" placeholder="Konten (Markdown)" rows={15} required className="w-full rounded-lg border px-3 py-2 text-sm font-mono" />
        <label className="flex items-center gap-2 text-sm">
          <input name="publish" type="checkbox" /> Publish langsung
        </label>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white">Simpan</button>
      </form>
    </div>
  );
}
