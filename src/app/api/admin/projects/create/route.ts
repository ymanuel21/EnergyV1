import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma } from '@/app/admin/lib/admin-prisma';
import { revalidatePath } from 'next/cache';

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  const prisma = await getAdminPrisma();
  
  // Auto-assign sortOrder
  const maxOrder = await prisma.project.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  const sortOrder = (maxOrder?.sortOrder ?? -1) + 1;

  // Generate URL-friendly slug
  const tempSlug = 'project-' + Date.now();
  
  const project = await prisma.project.create({
    data: {
      title: 'New Project',
      slug: tempSlug,
      coverImage: '',
      images: [],
      highlights: [],
      sortOrder,
    },
  });

  revalidatePath('/admin/projects');
  return NextResponse.redirect(new URL('/admin/projects', request.url));
}
