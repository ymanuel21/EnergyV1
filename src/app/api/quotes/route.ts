import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, phone, company, message } = await request.json();
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }
    const prisma = await getPrisma();
    await prisma.quoteRequest.create({
      data: { name, email, phone: phone || '', company: company || '', message: message || '' },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
