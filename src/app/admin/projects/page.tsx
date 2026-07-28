export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminPrisma } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

const CATEGORIES = ['residential', 'commercial', 'industrial', 'government', 'school'];

export default async function ProjectsPage() {
  const prisma = await getAdminPrisma();
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });

  async function handleCreate(data: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.project.create({
      data: {
        title: data.get('title') as string,
        slug: (data.get('slug') as string).toLowerCase().replace(/\s+/g, '-'),
        category: data.get('category') as string,
        capacity: data.get('capacity') as string,
        location: data.get('location') as string,
        customer: data.get('customer') as string,
        year: parseInt(data.get('year') as string) || 2025,
        description: data.get('description') as string,
      },
    });
    revalidatePath('/admin/projects');
  }

  async function handleToggle(id: string, published: boolean) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.project.update({ where: { id }, data: { published } });
    revalidatePath('/admin/projects');
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Projects</h1>
      <p className="text-sm text-muted mb-6">{projects.length} projects</p>

      <div className="grid gap-2 mb-8">
        {projects.map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className="text-sm font-medium text-primary flex-1">{p.title}</span>
            <span className="text-xs text-muted capitalize">{p.category} · {p.capacity} · {p.location}</span>
            {p.published ? <span className="text-[10px] text-green-600">Live</span> : <span className="text-[10px] text-amber-600">Draft</span>}
            <form action={handleToggle.bind(null, p.id, !p.published)} className="inline">
              <button type="submit" className="rounded border border-border px-2 py-1 text-[10px] text-muted">{p.published ? 'Unpublish' : 'Publish'}</button>
            </form>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-primary mb-3">Add Project</h2>
        <form action={handleCreate} className="grid gap-3 sm:grid-cols-2">
          <input name="title" placeholder="Project title" required className="rounded border border-border px-3 py-2 text-sm" />
          <input name="slug" placeholder="slug-name" required className="rounded border border-border px-3 py-2 text-sm" />
          <select name="category" className="rounded border border-border px-3 py-2 text-sm">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input name="capacity" placeholder="Capacity (e.g. 5 kWp)" className="rounded border border-border px-3 py-2 text-sm" />
          <input name="location" placeholder="Location" className="rounded border border-border px-3 py-2 text-sm" />
          <input name="customer" placeholder="Customer name" className="rounded border border-border px-3 py-2 text-sm" />
          <input name="year" type="number" placeholder="Year" defaultValue="2025" className="rounded border border-border px-3 py-2 text-sm" />
          <div className="sm:col-span-2">
            <textarea name="description" placeholder="Description" rows={3} className="w-full rounded border border-border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover sm:col-span-2">Create Project</button>
        </form>
      </div>
    </div>
  );
}
