export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminPrisma } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

async function getPages() {
  const prisma = await getAdminPrisma();
  return prisma.landingPage.findMany({ orderBy: { updatedAt: 'desc' } });
}

export default async function LandingPagesPage() {
  const pages = await getPages();

  async function handleCreate(formData: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.landingPage.create({
      data: {
        slug: (formData.get('slug') as string).toLowerCase().replace(/\s+/g, '-'),
        title: formData.get('title') as string,
      },
    });
    revalidatePath('/admin/pages');
  }

  async function handleDelete(id: string) {
    'use server';
    const prisma = await getAdminPrisma();
    const page = await prisma.landingPage.findUnique({ where: { id }, select: { slug: true } });
    await prisma.landingPage.delete({ where: { id } });
    revalidatePath('/admin/pages');
    if (page?.slug) revalidatePath('/' + page.slug);
  }

  async function handleTogglePublished(id: string, current: boolean) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.landingPage.update({ where: { id }, data: { published: !current } });
    revalidatePath('/admin/pages');
    const page = await prisma.landingPage.findUnique({ where: { id }, select: { slug: true } });
    if (page?.slug) revalidatePath('/' + page.slug);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Landing Pages</h1>
      <p className="text-sm text-muted mb-6">{pages.length} pages</p>

      <div className="grid gap-2">
        {pages.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className="text-sm font-medium text-primary flex-1">{p.title}</span>
            <span className="text-xs text-muted">/{p.slug}</span>
            <form action={handleTogglePublished.bind(null, p.id, p.published)} className="inline">
              <button type="submit" className={`rounded border px-2 py-0.5 text-[10px] font-medium transition ${p.published ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                {p.published ? '● Published' : '○ Draft'}
              </button>
            </form>
            <Link href={`/admin/pages/${p.id}`} className="rounded border border-border px-3 py-1 text-xs text-muted hover:bg-surface">Sections</Link>
            <Link href={`/${p.slug}`} target="_blank" className="rounded border border-border px-3 py-1 text-xs text-muted hover:bg-surface">View</Link>
            <form action={handleDelete.bind(null, p.id)} className="inline">
              <button type="submit" className="text-xs text-red-500 hover:underline">✕</button>
            </form>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-primary mb-3">Create Landing Page</h2>
        <form action={handleCreate} className="flex gap-2">
          <input name="title" placeholder="Page Title" required className="flex-1 rounded border border-border px-3 py-2 text-sm" />
          <input name="slug" placeholder="page-slug" required className="flex-1 rounded border border-border px-3 py-2 text-sm" />
          <button type="submit" className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover">Create</button>
        </form>
      </div>
    </div>
  );
}
