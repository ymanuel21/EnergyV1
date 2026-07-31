import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const prisma = await getAdminPrisma();
  const slug = 'project-' + Date.now();
  await prisma.project.create({
    data: { title: 'New Project', slug, coverImage: '', images: [], highlights: [] },
  });
  revalidatePath('/admin/projects');
  return NextResponse.redirect(new URL('/admin/projects', request.url));
}
