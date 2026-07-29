import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { productId, eventType, metadata } = await req.json();
    if (!productId || !eventType) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const prisma = await getPrisma();
    await prisma.productEvent.create({
      data: { productId, eventType, metadata: metadata || {}, sessionId: req.headers.get('x-session-id') || '' },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
