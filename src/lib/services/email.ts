/**
 * EmailService — reusable email notifications.
 * Uses Resend REST API. No library dependencies.
 * 
 * Provider: Resend (https://resend.com)
 * API: POST https://api.resend.com/emails
 * Env:   RESEND_API_KEY
 * 
 * Usage:
 *   const email = new EmailService();
 *   await email.sendQuoteNotification(quote);
 */

const RESEND_API = 'https://api.resend.com/emails';
const FROM_ADDRESS = 'EBTPlaza <notifications@ebtplaza.com>';

interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export class EmailService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    if (!this.apiKey) {
      console.warn('[EmailService] RESEND_API_KEY not set — emails will not be sent.');
    }
  }

  /** Check if email sending is available */
  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Send a notification email for a new quote request.
   * Does NOT throw — logs failures so the quote save is never rolled back.
   */
  async sendQuoteNotification(quote: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    message: string;
    createdAt: Date;
  }, recipients: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.log('[EmailService] Skipping — not configured.');
      return false;
    }
    if (!recipients?.trim()) {
      console.log('[EmailService] No recipients configured.');
      return false;
    }

    const to = recipients.split(',').map(e => e.trim()).filter(Boolean);
    if (to.length === 0) return false;

    const date = new Date(quote.createdAt);
    const dateStr = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const adminUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://energyv1.vercel.app';
    const quoteUrl = `${adminUrl}/admin/quotes/${quote.id}`;

    const subject = `New Quote Request — ${quote.name}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px;">
        <h2 style="color: #1a1a1a;">New Quote Request</h2>
        
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 16px 0;">
          <h3 style="color: #374151; margin: 0 0 12px;">Customer</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #6b7280; padding: 4px 0;">Name</td><td style="color: #111827;">${this.esc(quote.name)}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Company</td><td style="color: #111827;">${this.esc(quote.company || '—')}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Email</td><td style="color: #111827;">${this.esc(quote.email)}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Phone</td><td style="color: #111827;">${this.esc(quote.phone || '—')}</td></tr>
          </table>
        </div>

        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 16px 0;">
          <h3 style="color: #374151; margin: 0 0 12px;">Project Information</h3>
          <pre style="font-family: inherit; font-size: 14px; color: #111827; white-space: pre-wrap; margin: 0;">${this.esc(quote.message)}</pre>
        </div>

        <p style="color: #6b7280; font-size: 12px;">Submitted: ${dateStr} at ${timeStr}</p>

        <a href="${quoteUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
          View Quote →
        </a>
      </div>
    `;

    return this.send({ to, subject, html });
  }

  /**
   * Generic email send method.
   * Logs errors, returns success boolean. Never throws.
   */
  async send({ to, subject, html }: EmailParams): Promise<boolean> {
    if (!this.isConfigured) return false;

    const recipients = Array.isArray(to) ? to : [to];

    try {
      const res = await fetch(RESEND_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: recipients,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error(`[EmailService] Send failed (${res.status}):`, err);
        return false;
      }

      const data = await res.json();
      console.log(`[EmailService] Sent to ${recipients.length} recipient(s): ${(data as any).id}`);
      return true;
    } catch (err) {
      console.error('[EmailService] Send error:', err);
      return false;
    }
  }

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '&quot;');
  }
}

/** Singleton */
export const emailService = new EmailService();
