export const dynamic = 'force-dynamic';
import { getAdminPrisma } from '../lib/admin-prisma';

export default async function ProjectsAdminPage() {
  const prisma = await getAdminPrisma();
  const raw = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  const projects = raw.map((p: any) => ({
    id: p.id, title: p.title, slug: p.slug,
    category: p.category, location: p.location,
    year: p.year, status: p.status,
  }));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-primary">Projects</h1>
        <form method="POST" action="/api/admin/projects/create" className="inline">
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">
            + New Project
          </button>
        </form>
      </div>
      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="p-4 text-left font-medium text-primary">Title</th>
            <th className="p-4 text-left font-medium text-primary">Category</th>
            <th className="p-4 text-left font-medium text-primary">Location</th>
            <th className="p-4 text-left font-medium text-primary">Year</th>
            <th className="p-4 text-left font-medium text-primary">Status</th>
            <th className="p-4 text-right font-medium text-primary">Actions</th>
          </tr></thead>
          <tbody>
            {projects.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="p-4"><a href={`/admin/projects/${p.id}`} className="font-medium text-primary hover:text-primary-hover">{p.title || 'Untitled'}</a></td>
                <td className="p-4 text-muted capitalize">{p.category}</td>
                <td className="p-4 text-muted">{p.location || '-'}</td>
                <td className="p-4 text-muted">{p.year}</td>
                <td className="p-4"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === 'published' ? 'bg-green-50 text-green-700' : p.status === 'archived' ? 'bg-red-50 text-red-700' : 'bg-surface text-muted'}`}>{p.status || 'draft'}</span></td>
                <td className="p-4 text-right">
                  <a href={`/admin/projects/${p.id}`} className="text-sm text-primary hover:underline mr-3">Edit</a>
                  <form method="POST" action="/api/admin/projects/delete" className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-sm text-red-500 hover:underline">Delete</button>
                  </form>
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
