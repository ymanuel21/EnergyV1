import { NextRequest, NextResponse } from 'next/server';
import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get('q') || '';
  if (q.length < 2) return NextResponse.json([]);

  const prisma = await getAdminPrisma();
  const projects = await prisma.project.findMany({
    where: { title: { contains: q, mode: 'insensitive' } },
    select: { id: true, slug: true, title: true, category: true, location: true, coverImage: true, images: true },
    take: 8,
    orderBy: { year: 'desc' },
  });

  // Map to ProductPickerField-compatible format (name, images)
  const mapped = projects.map(p => ({
    ...p,
    name: p.title,
    images: p.coverImage ? [p.coverImage] : (Array.isArray(p.images) ? p.images : []),
  }));

  return NextResponse.json(mapped);
}
