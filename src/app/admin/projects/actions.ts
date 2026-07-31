'use server';

import { getAdminPrisma } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function createProject() {
  const prisma = await getAdminPrisma();
  const slug = 'project-' + Date.now();
  await prisma.project.create({
    data: { title: 'New Project', slug, coverImage: '', images: [], highlights: [] },
  });
  revalidatePath('/admin/projects');
}

export async function deleteProject(formData: FormData) {
  const { projectRepo } = await import('@/lib/repositories/project');
  const id = formData.get('id') as string;
  if (!id) return;
  await projectRepo.delete(id);
  revalidatePath('/admin/projects');
}
