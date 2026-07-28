import { NextResponse } from 'next/server';
import { productRepo } from '@/lib/repositories/product';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (q.length < 1) return NextResponse.json([]);

  const suggestions = await productRepo.searchSuggestions(q, 8);
  return NextResponse.json(suggestions);
}
