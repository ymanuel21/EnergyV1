import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/api/categories';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([]);
  }
}
