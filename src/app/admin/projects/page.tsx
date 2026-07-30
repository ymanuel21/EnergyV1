export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../lib/admin-prisma';

export default async function ProjectsAdminPage() {
  const prisma = await getAdminPrisma();
  return <div className="p-6"><h1>Projects</h1><p>prisma ok</p></div>;
}
