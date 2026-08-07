/**
 * Diagnostic: Trace the exact email notification flow.
 * Tests: RESEND_API_KEY presence, isConfigured, recipient parsing, Resend API call.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

// ── Mirror EmailService logic exactly ──
const RESEND_API = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'EBTPlaza <notifications@ebtplaza.com>';

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('=== EMAIL NOTIFICATION DIAGNOSTIC ===\n');

  // 1. Check RESEND_API_KEY
  const apiKey = process.env.RESEND_API_KEY || '';
  console.log(`1. RESEND_API_KEY: ${apiKey ? `SET (${apiKey.substring(0, 6)}...)` : 'MISSING'}`);
  console.log(`   isConfigured: ${!!apiKey}\n`);

  if (!apiKey) {
    console.log('❌ ROOT CAUSE: RESEND_API_KEY is not set in the environment.');
    console.log('   EmailService.isConfigured returns false.');
    console.log('   sendQuoteNotification() returns early at line 51-53:');
    console.log('   if (!this.isConfigured) { console.log("Skipping — not configured."); return false; }\n');
    console.log('FIX: Add RESEND_API_KEY to Vercel Environment Variables.');
    return;
  }

  // 2. Check recipients setting
  console.log('2. Reading recipients from siteSetting...');
  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'quote_notification_recipients' }
  });
  console.log(`   siteSetting value: "${setting?.value || '(none — not set)'}"\n`);

  if (!setting?.value) {
    console.log('❌ SECONDARY ISSUE: quote_notification_recipients is not configured.');
    console.log('   sendQuoteNotification returns early at line 55-57.');
    console.log('FIX: Go to /admin/settings → Quote Notifications → add recipient emails.\n');
    return;
  }

  // 3. Parse recipients
  const to = setting.value.split(',').map((e: string) => e.trim()).filter(Boolean);
  console.log(`3. Parsed recipients: [${to.join(', ')}]`);
  console.log(`   FROM address: "${FROM_ADDRESS}"\n`);

  // 4. Check for a recent quote to use as test data
  const quote = await prisma.quoteRequest.findFirst({
    orderBy: { createdAt: 'desc' }
  });

  if (!quote) {
    console.log('4. No quote found to test with. Creating a test quote...');
    const testQuote = await prisma.quoteRequest.create({
      data: {
        name: 'Test Diagnostic',
        email: 'test@example.com',
        phone: '081234567890',
        company: 'Test Corp',
        message: 'Test message for diagnostic',
        status: 'pending',
      }
    });
    console.log(`   Created: id=${testQuote.id} name="${testQuote.name}"\n`);

    // 5. Send to Resend
    console.log('5. Sending to Resend...');
    const payload = {
      from: FROM_ADDRESS,
      to,
      subject: `New Quote Request — ${testQuote.name}`,
      html: `<p>Test email from diagnostic.</p>`,
    };

    console.log(`   POST ${RESEND_API}`);
    console.log(`   Payload: ${JSON.stringify(payload, null, 2).substring(0, 500)}`);

    try {
      const res = await fetch(RESEND_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = await res.text();
      console.log(`\n   HTTP ${res.status}`);
      console.log(`   Response: ${body.substring(0, 500)}`);

      if (res.ok) {
        console.log('\n✅ EMAIL SENT SUCCESSFULLY');
      } else {
        console.log('\n❌ RESEND REJECTED THE REQUEST');
        console.log('   Check: domain verification, API key validity, recipient restrictions');
      }
    } catch (err: any) {
      console.log(`\n❌ NETWORK ERROR: ${err.message}`);
    }

    // Cleanup
    await prisma.quoteRequest.delete({ where: { id: testQuote.id } });
    console.log('   Test quote cleaned up.');
  } else {
    console.log(`4. Using existing quote: id=${quote.id.substring(0, 12)}... name="${quote.name}"\n`);

    // 5. Send to Resend
    console.log('5. Sending to Resend...');
    const payload = {
      from: FROM_ADDRESS,
      to,
      subject: `New Quote Request — ${quote.name}`,
      html: `<p>Test email from diagnostic for quote ${quote.id}.</p>`,
    };

    console.log(`   POST ${RESEND_API}`);
    console.log(`   To: [${to.join(', ')}]`);
    console.log(`   From: ${FROM_ADDRESS}`);

    try {
      const res = await fetch(RESEND_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const body = await res.text();
      console.log(`\n   HTTP ${res.status}`);
      console.log(`   Response: ${body}`);

      if (res.ok) {
        console.log('\n✅ EMAIL SENT SUCCESSFULLY');
      } else {
        console.log('\n❌ RESEND REJECTED THE REQUEST');
      }
    } catch (err: any) {
      console.log(`\n❌ NETWORK ERROR: ${err.message}`);
    }
  }
}

main().catch(e => console.error('Diagnostic error:', e)).finally(() => pool.end());
