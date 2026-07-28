export const dynamic = "force-dynamic";

import { notFound, redirect } from 'next/navigation';
import { getArticle, updateArticle, deleteArticle } from '../actions';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) notFound();

  async function handleUpdate(data: FormData) {
    'use server';
    await updateArticle(id, {
      title: data.get('title'),
      excerpt: data.get('excerpt'),
      content: data.get('content'),
      slug: (data.get('title') as string).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      readTime: Math.ceil((data.get('content') as string).split(' ').length / 200),
      isPublished: data.get('publish') === 'on',
    });
    redirect('/admin/articles');
  }

  async function handleDelete() {
    'use server';
    await deleteArticle(id);
    redirect('/admin/articles');
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Edit Artikel</h1>
        <form action={handleDelete}>
          <button className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50">Hapus</button>
        </form>
      </div>
      <form action={handleUpdate} className="mt-6 space-y-4 rounded-xl border bg-card p-6">
        <input name="title" defaultValue={article.title} required className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea name="excerpt" defaultValue={article.excerpt ?? ''} rows={2} className="w-full rounded-lg border px-3 py-2 text-sm" />
        <textarea name="content" defaultValue={article.content} rows={15} required className="w-full rounded-lg border px-3 py-2 text-sm font-mono" />
        <label className="flex items-center gap-2 text-sm">
          <input name="publish" type="checkbox" defaultChecked={article.isPublished} /> Published
        </label>
        <button type="submit" className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white">Simpan</button>
      </form>
    </div>
  );
}
