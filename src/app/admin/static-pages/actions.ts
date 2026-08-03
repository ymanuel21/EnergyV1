'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function getStaticPages() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.staticPage.findMany({ orderBy: { title: 'asc' } });
}

export async function updateStaticPage(id: string, data: { title?: string; slug?: string; content?: string; description?: string }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  await prisma.staticPage.update({ where: { id }, data });
  revalidatePath('/admin/static-pages');
  const page = await prisma.staticPage.findUnique({ where: { id }, select: { slug: true } });
  if (page?.slug) revalidatePath('/halaman/' + page.slug);
}
