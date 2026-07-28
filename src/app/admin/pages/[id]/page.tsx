export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getAdminPrisma } from '../../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import { sectionTypes } from '@/lib/section-registry';

type Props = { params: Promise<{ id: string }> };

export default async function LandingPageEditor({ params }: Props) {
  const { id } = await params;
  const prisma = await getAdminPrisma();
  const page = await prisma.landingPage.findUnique({ where: { id } });
  if (!page) notFound();

  const sections = await prisma.homepageSection.findMany({
    where: { pageId: id },
    orderBy: { sortOrder: 'asc' },
  });

  async function handleAdd(data: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.homepageSection.create({
      data: {
        pageId: id,
        type: data.get('type') as string,
        title: data.get('title') as string,
        sortOrder: sections.length,
        status: 'draft',
        enabled: false,
        settings: JSON.parse((data.get('settings') as string) || '{}'),
      },
    });
    revalidatePath(`/admin/pages/${id}`);
  }

  async function handleToggle(sectionId: string, enabled: boolean) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.homepageSection.update({ where: { id: sectionId }, data: { enabled, status: enabled ? 'published' : 'draft' } });
    revalidatePath(`/admin/pages/${id}`);
  }

  async function handleDelete(sectionId: string) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.homepageSection.delete({ where: { id: sectionId } });
    revalidatePath(`/admin/pages/${id}`);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin/pages" className="text-muted hover:text-primary">←</a>
        <div>
          <h1 className="text-2xl font-bold text-primary">{page.title}</h1>
          <p className="text-sm text-muted">/{page.slug} · {sections.length} sections</p>
        </div>
        <a href={`/${page.slug}`} target="_blank" className="ml-auto rounded border border-border px-4 py-2 text-sm text-muted hover:bg-surface">Preview →</a>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {sections.map((s: any, i: number) => (
          <div key={s.id} className={`flex items-center gap-3 rounded-lg border p-3 ${s.enabled ? 'border-border bg-card' : 'border-red-200 bg-red-50/30'}`}>
            <span className="text-xs text-muted w-6">{i + 1}</span>
            <span className="text-xl">{sectionTypes.find(t => t.type === s.type)?.icon || '📄'}</span>
            <span className="flex-1 text-sm font-medium text-primary">{s.title || s.type}</span>
            <span className={`text-[10px] ${s.enabled ? 'text-green-600' : 'text-red-500'}`}>{s.enabled ? 'ON' : 'OFF'}</span>
            <form action={handleToggle.bind(null, s.id, !s.enabled)} className="inline">
              <button type="submit" className="rounded border border-border px-2 py-1 text-[10px] text-muted">{s.enabled ? 'Disable' : 'Enable'}</button>
            </form>
            <form action={handleDelete.bind(null, s.id)} className="inline">
              <button type="submit" className="text-xs text-red-500 hover:underline">✕</button>
            </form>
          </div>
        ))}
      </div>

      {sections.length === 0 && <p className="text-sm text-muted py-4">No sections yet. Add one:</p>}

      {/* Add section */}
      <div className="mt-6 border-t border-border pt-4 grid gap-2 sm:grid-cols-5">
        {sectionTypes.map(({ type, label, icon, defaultSettings }) => (
          <form key={type} action={handleAdd}>
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="title" value={label} />
            <input type="hidden" name="settings" value={JSON.stringify(defaultSettings)} />
            <button type="submit" className="w-full rounded-lg border border-border bg-card p-3 text-center hover:border-primary transition">
              <span className="text-xl block mb-1">{icon}</span>
              <span className="text-xs font-medium text-primary">{label}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
