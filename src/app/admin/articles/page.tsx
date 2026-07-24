export const dynamic = "force-dynamic";

import Link from 'next/link';
import { getArticles, deleteArticle } from './actions';
import { revalidatePath } from 'next/cache';

export default async function ArticlesPage() {
  const articles = await getArticles();

  async function handleDelete(id: string) {
    'use server';
    await deleteArticle(id);
    revalidatePath('/admin/articles');
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Artikel</h1>
        <Link href="/admin/articles/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + Tulis Artikel
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Penulis</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.map((a: any) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                <td className="px-4 py-3 text-gray-500">{a.author}</td>
                <td className="px-4 py-3">
                  <span className={a.isPublished ? 'text-green-600' : 'text-yellow-600'}>
                    {a.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <Link href={`/admin/articles/${a.id}`} className="text-brand-600 hover:underline text-xs">Edit</Link>
                  <form action={handleDelete.bind(null, a.id)}>
                    <button className="text-red-500 hover:underline text-xs">Hapus</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
