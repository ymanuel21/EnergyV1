// API: resolve price display for a product
// POST /api/pricing-display — body: { product: { price, originalPrice?, priceDisplayMode?, customPriceLabel?, slug? } }

import { NextResponse } from 'next/server';
import { resolvePriceDisplay } from '@/lib/services/product-pricing';

export async function POST(request: Request) {
  try {
    const { product } = await request.json();
    const display = await resolvePriceDisplay(product || { price: 0 });
    return NextResponse.json(display);
  } catch {
    return NextResponse.json({ mode: 'SHOW_PRICE', label: '—', showPrice: false, cta: null });
  }
}
