export const dynamic = 'force-dynamic';
import { getAdminPrisma } from '../lib/admin-prisma';

export default async function ProjectsAdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-primary mb-4">Projects</h1>
      <p className="text-muted">Import test.</p>
    </div>
  );
}
