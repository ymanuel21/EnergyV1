import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/api/products';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
