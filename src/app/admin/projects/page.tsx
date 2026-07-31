export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getAdminPrisma } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import { StatusBadge } from '@/components/admin/StatusBadge';

export default async function ProjectsAdminPage() {
  const prisma = await getAdminPrisma();
  const raw = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  // Serialize Date objects for RSC transport
  const projects = raw.map((p: any) => ({
    ...p,
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() || p.updatedAt,
    publishedAt: p.publishedAt?.toISOString?.() || p.publishedAt,
  }));

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
              <th className="p-4 text-left font-medium text-primary">Title</th><th className="p-4 text-left font-medium text-primary">Category</th><th className="p-4 text-left font-medium text-primary">Location</th><th className="p-4 text-left font-medium text-primary">Year</th><th className="p-4 text-left font-medium text-primary">Status</th><th className="p-4 text-right font-medium text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="p-4"><Link href={`/admin/projects/${p.id}`} className="font-medium text-primary hover:text-primary-hover">{p.title || 'Untitled'}</Link></td>
                <td className="p-4 text-muted capitalize">{p.category}</td>
                <td className="p-4 text-muted">{p.location || '-'}</td>
                <td className="p-4 text-muted">{p.year}</td>
                <td className="p-4"><StatusBadge status={p.status || 'draft'} /></td>
                <td className="p-4 text-right">
                  <Link href={`/admin/projects/${p.id}`} className="text-sm text-primary hover:underline mr-3">Edit</Link>
                  <form action={deleteProject} className="inline"><input type="hidden" name="id" value={p.id} /><button type="submit" className="text-sm text-red-500 hover:underline" onClick={(e) => { if (!confirm('Delete project?')) e.preventDefault(); }}>Delete</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted mt-2">{projects.length} projects</p>
    </div>
  );
}

async function createProject() {
  'use server';
  const prisma = await getAdminPrisma();
  const slug = 'project-' + Date.now();
  await prisma.project.create({ data: { title: 'New Project', slug, coverImage: '', images: [], highlights: [] } });
  revalidatePath('/admin/projects');
}

async function deleteProject(formData: FormData) {
  'use server';
  const { projectRepo } = await import('@/lib/repositories/project');
  const id = formData.get('id') as string;
  if (!id) return;
  await projectRepo.delete(id);
  revalidatePath('/admin/projects');
}
