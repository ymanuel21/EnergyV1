export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getAdminPrisma } from '../lib/admin-prisma';

export default async function ProjectsAdminPage() {
  const prisma = await getAdminPrisma();
  const raw = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  const projects = raw.map((p: any) => ({
    ...p, createdAt: p.createdAt?.toISOString?.() || p.createdAt,
  }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-primary mb-4">Projects ({projects.length})</h1>
      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-4 text-left font-medium text-primary">Title</th><th className="p-4 text-left font-medium text-primary">Category</th><th className="p-4 text-left font-medium text-primary">Location</th><th className="p-4 text-left font-medium text-primary">Year</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50">
                <td className="p-4"><Link href={`/admin/projects/${p.id}`} className="font-medium text-primary hover:text-primary-hover">{p.title || 'Untitled'}</Link></td>
                <td className="p-4 text-muted capitalize">{p.category}</td>
                <td className="p-4 text-muted">{p.location || '-'}</td>
                <td className="p-4 text-muted">{p.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted mt-2">{projects.length} projects</p>
    </div>
  );
}
