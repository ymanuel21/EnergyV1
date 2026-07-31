export const dynamic = 'force-dynamic';
import { getAdminPrisma } from '../lib/admin-prisma';

export default async function ProjectsAdminPage() {
  const prisma = await getAdminPrisma();
  const count = await prisma.project.count();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-primary mb-4">Projects</h1>
      <p className="text-muted">{count} projects found.</p>
    </div>
  );
}
