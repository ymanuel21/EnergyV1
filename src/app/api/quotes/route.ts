import { NextResponse } from 'next/server';
import { safeWrite } from '@/lib/transaction';
import { emailService } from '@/lib/services/email';
import { getPrisma } from '@/lib/db';
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

    // 1. Save to database
    let quote: any;
    await safeWrite({
      entityType: 'quoteRequest',
      entityName: validated.name,
      action: 'create',
      data: validated,
      schema: quoteSchema,
      execute: async (tx: any) => {
        quote = await tx.quoteRequest.create({ data: validated });
        return quote;
      },
    });

    // 2. Send email notification (fire-and-forget — never blocks or fails the response)
    if (quote) {
      try {
        const prisma = await getPrisma();
        const recipients = await prisma.siteSetting.findUnique({
          where: { key: 'quote_notification_recipients' }
        });
        if (recipients?.value) {
          emailService.sendQuoteNotification(quote, recipients.value).catch(err => {
            console.error('[Quotes] Email notification failed:', err);
          });
        }
      } catch (err) {
        console.error('[Quotes] Failed to read recipients setting:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.name === 'ZodError') {
      return NextResponse.json({ error: e.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
