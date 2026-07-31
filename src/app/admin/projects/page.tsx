export const dynamic = 'force-dynamic';
import { getAdminPrisma } from '../lib/admin-prisma';
import Link from 'next/link';

export default async function ProjectsAdminPage() {
  const prisma = await getAdminPrisma();
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 5 });

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-primary mb-4">Projects ({projects.length})</h1>
      {projects.map((p: any) => (
        <div key={p.id} className="mb-2">
          <Link href={`/admin/projects/${p.id}`} className="text-primary hover:underline">{p.title}</Link>
          <span className="text-muted text-sm ml-2">{p.category} · {p.location}</span>
        </div>
      ))}
    </div>
  );
}
