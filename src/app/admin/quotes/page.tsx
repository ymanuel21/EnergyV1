export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';

const STATUSES = ['pending', 'contacted', 'survey_scheduled', 'proposal_sent', 'won', 'lost'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', contacted: 'Contacted', survey_scheduled: 'Survey Scheduled',
  proposal_sent: 'Proposal Sent', won: 'Won ✅', lost: 'Lost ❌',
};

export default async function QuotesPage() {
  const prisma = await getAdminPrisma();
  const quotes = await prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' } });

  async function handleStatus(id: string, status: string) {
    'use server';
    const prisma = await getAdminPrisma();
    await prisma.quoteRequest.update({ where: { id }, data: { status } });
    revalidatePath('/admin/quotes');
  }

  const byStatus: Record<string, any[]> = {};
  for (const s of STATUSES) byStatus[s] = quotes.filter((q: any) => q.status === s);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-2">Quote Requests</h1>
      <p className="text-sm text-muted mb-6">{quotes.length} total · {byStatus.pending.length} pending</p>

      {STATUSES.map(status => (
        <div key={status} className="mb-6">
          <h2 className="text-sm font-semibold text-primary mb-2">{STATUS_LABELS[status]} ({byStatus[status].length})</h2>
          {byStatus[status].length === 0 && <p className="text-xs text-muted p-3">None</p>}
          {byStatus[status].map((q: any) => (
            <div key={q.id} className="flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 mb-1">
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{q.name}{q.company ? ` · ${q.company}` : ''}</p>
                <p className="text-xs text-muted">{q.email} · {q.phone}</p>
                {q.message && <p className="text-xs text-muted mt-1 italic">&ldquo;{q.message.substring(0, 120)}&rdquo;</p>}
                <p className="text-[10px] text-muted/60 mt-1">{new Date(q.createdAt).toLocaleDateString('id-ID')}</p>
              </div>
              <form action={handleStatus.bind(null, q.id, '')}>
                <select name="status" defaultValue={q.status} onChange={(e) => {
                  const s = e.target.value;
                  if (s) { e.target.form!.requestSubmit(); }
                }} className="rounded border border-border px-2 py-1 text-xs">
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                <input type="hidden" name="id" value={q.id} />
              </form>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
