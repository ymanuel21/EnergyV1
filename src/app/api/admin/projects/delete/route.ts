import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const id = formData.get('id') as string;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { projectRepo } = await import('@/lib/repositories/project');
  await projectRepo.delete(id);
  revalidatePath('/admin/projects');
  return NextResponse.redirect(new URL('/admin/projects', request.url));
}
