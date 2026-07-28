import { NextResponse } from 'next/server';
import { safeWrite } from '@/lib/transaction';
import { z } from 'zod';

const quoteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().default(''),
  company: z.string().default(''),
  message: z.string().default(''),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = quoteSchema.parse(body);
    await safeWrite({
      entityType: 'quoteRequest',
      entityName: validated.name,
      action: 'create',
      data: validated,
      schema: quoteSchema,
      execute: async (tx: any) =>
        tx.quoteRequest.create({ data: validated }),
    });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
