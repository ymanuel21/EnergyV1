export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../lib/admin-prisma';

export default async function ProjectsAdminPage() {
  let msg = 'start';
  try {
    const prisma = await getAdminPrisma();
    msg = 'prisma ok';
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    msg = `projects: ${projects.length}`;
    return <div className="p-6"><h1>Projects</h1><p>{msg}</p><p>First: {projects[0]?.title || 'none'}</p></div>;
  } catch (e: any) {
    return <div className="p-6"><h1>Error</h1><p>{msg}</p><p>{e.message}</p></div>;
  }
}
