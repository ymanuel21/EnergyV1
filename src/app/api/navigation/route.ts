import { NextResponse } from 'next/server';
import { getPublicNavigationLinks } from '@/lib/api/navigation';

export async function GET() {
  const links = await getPublicNavigationLinks();
  return NextResponse.json(links);
}
