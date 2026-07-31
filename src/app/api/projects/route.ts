import { NextRequest, NextResponse } from 'next/server';
import { projectRepo } from '@/lib/repositories/project';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
  const project = await projectRepo.findBySlug(slug);
  if (!project) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(project);
}
