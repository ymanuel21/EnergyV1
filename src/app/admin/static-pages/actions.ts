'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function getStaticPages() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  try {
    return await prisma.staticPage.findMany({ orderBy: { title: 'asc' } });
  } catch {
    // Fallback: description column may not exist yet on Vercel DB
    return (await import('@/lib/data/static-pages')).staticPages.map(p => ({
      ...p, id: p.slug, updatedAt: new Date(), description: '',
    }));
  }
}

export async function updateStaticPage(id: string, data: { title?: string; slug?: string; content?: string; description?: string }) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  try {
    await prisma.staticPage.update({ where: { id }, data });
  } catch {
    // Strip description if column doesn't exist on Vercel DB
    const { description: _, ...safe } = data;
    await prisma.staticPage.update({ where: { id }, data: safe });
  }
  revalidatePath('/admin/static-pages');
  const page = await prisma.staticPage.findUnique({ where: { id }, select: { slug: true } });
  if (page?.slug) revalidatePath('/halaman/' + page.slug);
}
