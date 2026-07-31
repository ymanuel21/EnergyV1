export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getAdminPrisma } from '../lib/admin-prisma';

export default async function ProjectsAdminPage() {
  const prisma = await getAdminPrisma();
  const raw = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  const projects = raw.map((p: any) => ({
    ...p,
    createdAt: p.createdAt?.toISOString?.() || p.createdAt,
    updatedAt: p.updatedAt?.toISOString?.() || p.updatedAt,
  }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-primary mb-4">Projects ({projects.length})</h1>
      {projects.map((p: any) => (
        <div key={p.id} className="mb-2">
          <Link href={`/admin/projects/${p.id}`} className="text-primary hover:underline">{p.title}</Link>
          <span className="text-muted text-sm ml-2">{p.category} · {p.location} · {p.year}</span>
        </div>
      ))}
    </div>
  );
}
