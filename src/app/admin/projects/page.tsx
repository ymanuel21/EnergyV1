export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminPrisma } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import { projectRepo } from '@/lib/repositories/project';
import { archiveEntity, publishEntity } from '@/lib/services/content-versioning';
import { StatusBadge } from '@/components/admin/StatusBadge';

const CATEGORIES = ['residential', 'commercial', 'industrial', 'government', 'school'];
const SYSTEM_TYPES = ['', 'On-Grid', 'Off-Grid', 'Hybrid'];

export default async function ProjectsAdminPage() {
  const prisma = await getAdminPrisma();
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">Projects</h1>
        <form action={createProject} className="inline">
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">+ New Project</button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left font-medium text-primary">Title</th>
              <th className="p-4 text-left font-medium text-primary hidden md:table-cell">Category</th>
              <th className="p-4 text-left font-medium text-primary hidden md:table-cell">Location</th>
              <th className="p-4 text-left font-medium text-primary hidden md:table-cell">Year</th>
              <th className="p-4 text-left font-medium text-primary">Status</th>
              <th className="p-4 text-right font-medium text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-surface/50 transition">
                <td className="p-4">
                  <Link href={`/admin/projects/${p.id}`} className="font-medium text-primary hover:text-primary-hover">{p.title || 'Untitled'}</Link>
                </td>
                <td className="p-4 hidden md:table-cell text-muted capitalize">{p.category}</td>
                <td className="p-4 hidden md:table-cell text-muted">{p.location || '-'}</td>
                <td className="p-4 hidden md:table-cell text-muted">{p.year}</td>
                <td className="p-4">
                  <StatusBadge status={p.status || (p.published ? 'published' : 'draft')} />
                </td>
                <td className="p-4 text-right">
                  <Link href={`/admin/projects/${p.id}`} className="text-sm text-primary hover:underline mr-3">Edit</Link>
                  <form action={deleteProject} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-sm text-red-500 hover:underline" onClick={(e) => { if (!confirm('Delete?')) e.preventDefault(); }}>Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {projects.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted">No projects yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {projects.filter((p: any) => p.status === 'published' || p.published).slice(0, 6).map((p: any) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-primary">{p.title}</h3>
                <p className="text-xs text-muted mt-1">{p.category} · {p.location} · {p.year}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${p.featured ? 'bg-amber-50 text-amber-700' : 'bg-surface text-muted'}`}>
                {p.featured ? '⭐ Featured' : 'Standard'}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <form action={toggleFeatured} className="inline"><input type="hidden" name="id" value={p.id} /><button className="text-xs text-primary hover:underline">{p.featured ? 'Unfeature' : 'Feature'}</button></form>
              <form action={toggleStatus} className="inline"><input type="hidden" name="id" value={p.id} /><button className="text-xs text-primary hover:underline">{p.status === 'published' ? 'Archive' : 'Publish'}</button></form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Server actions
async function createProject() {
  'use server';
  const prisma = await getAdminPrisma();
  const slug = 'project-' + Date.now();
  await prisma.project.create({ data: { title: 'New Project', slug, coverImage: '', images: [], highlights: [] } });
  revalidatePath('/admin/projects');
}

async function deleteProject(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  if (!id) return;
  await projectRepo.delete(id);
  revalidatePath('/admin/projects');
}

async function toggleFeatured(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const prisma = await getAdminPrisma();
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) return;
  await prisma.project.update({ where: { id }, data: { featured: !p.featured } });
  revalidatePath('/admin/projects');
}

async function toggleStatus(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const prisma = await getAdminPrisma();
  const p = await prisma.project.findUnique({ where: { id } });
  if (!p) return;
  if (p.status === 'published') {
    await archiveEntity({ entity: 'project', id });
  } else {
    await publishEntity({ entity: 'project', id });
  }
  revalidatePath('/admin/projects');
}
