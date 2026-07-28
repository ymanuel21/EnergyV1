import { NextResponse } from 'next/server';
import { brandRepo } from '@/lib/repositories/brand';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const popular = searchParams.get('popular');
    if (popular) {
      const brands = await brandRepo.findPopular(parseInt(popular));
      return NextResponse.json(brands);
    }
    const brands = await brandRepo.findAll(true);
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json([]);
  }
}
