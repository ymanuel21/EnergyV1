import { NextResponse } from 'next/server';
import { getAllBrands } from '@/lib/api/brands';

export async function GET() {
  try {
    const brands = await getAllBrands();
    return NextResponse.json(brands);
  } catch {
    return NextResponse.json([]);
  }
}
