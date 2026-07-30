export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../lib/admin-prisma';

export default async function ProjectsAdminPage() {
  try {
    const prisma = await getAdminPrisma();
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return <div className="p-6"><h1>Projects</h1><p>{projects.length} found</p></div>;
  } catch (e: any) {
    return <div className="p-6"><h1>Error</h1><p>{e.message}</p></div>;
  }
}
