export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getAdminPrisma } from '../../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import Link from 'next/link';

const STATUSES = ['pending', 'contacted', 'survey_scheduled', 'proposal_sent', 'won', 'lost'] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', contacted: 'Contacted', survey_scheduled: 'Survey Scheduled',
  proposal_sent: 'Proposal Sent', won: 'Won', lost: 'Lost',
};

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prisma = await getAdminPrisma();
  const quote = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!quote) notFound();

  const followUps = (quote.followUps as any[]) || [];

  async function handleStatusUpdate(formData: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    const id = formData.get('id') as string;
    const newStatus = formData.get('status') as string;
    await prisma.quoteRequest.update({ where: { id }, data: { status: newStatus } });
    revalidatePath(`/admin/quotes/${id}`);
  }

  async function handleAddNote(formData: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    const id = formData.get('id') as string;
    const note = formData.get('note') as string;
    if (!note?.trim()) return;

    const session = await auth();
    const author = session?.user?.name || 'Admin';

    const current = await prisma.quoteRequest.findUnique({ where: { id }, select: { followUps: true } });
    const existing = (current?.followUps as any[]) || [];
    const updated = [...existing, { note: note.trim(), author, createdAt: new Date().toISOString() }];

    await prisma.quoteRequest.update({ where: { id }, data: { followUps: updated } });
    revalidatePath(`/admin/quotes/${id}`);
  }

  async function handleUpdateNotes(formData: FormData) {
    'use server';
    const prisma = await getAdminPrisma();
    const id = formData.get('id') as string;
    const notes = formData.get('notes') as string;
    await prisma.quoteRequest.update({ where: { id }, data: { notes } });
    revalidatePath(`/admin/quotes/${id}`);
  }

  const nextActions: Record<string, string[]> = {
    pending: ['contacted'],
    contacted: ['survey_scheduled'],
    survey_scheduled: ['proposal_sent'],
    proposal_sent: ['won', 'lost'],
    won: [],
    lost: [],
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/quotes" className="text-muted hover:text-primary text-sm">← Back</Link>
        <h1 className="text-xl font-bold text-primary">Quote Detail</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-primary mb-4">Customer Information</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div><span className="text-xs text-muted">Name</span><p className="font-medium text-primary">{quote.name}</p></div>
              <div><span className="text-xs text-muted">Company</span><p className="font-medium text-primary">{quote.company || '—'}</p></div>
              <div><span className="text-xs text-muted">Email</span><p className="font-medium text-primary">{quote.email || '—'}</p></div>
              <div><span className="text-xs text-muted">Phone</span><p className="font-medium text-primary">{quote.phone || '—'}</p></div>
            </div>
          </div>

          {/* Message */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-primary mb-3">Request Message</h2>
            <p className="text-sm text-muted whitespace-pre-wrap">{quote.message || 'No message provided.'}</p>
          </div>

          {/* Follow-up Timeline */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-primary mb-4">Follow-up Timeline ({followUps.length})</h2>
            {followUps.length === 0 && <p className="text-sm text-muted">No follow-ups yet.</p>}
            <div className="space-y-3">
              {followUps.map((f: any, i: number) => (
                <div key={i} className="border-l-2 border-primary/20 pl-4 py-1">
                  <p className="text-sm text-muted">{f.note}</p>
                  <p className="text-xs text-muted/60 mt-1">
                    {f.author} · {new Date(f.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>

            {/* Add follow-up */}
            <form action={handleAddNote} className="mt-4 flex gap-2">
              <input type="hidden" name="id" value={quote.id} />
              <input name="note" placeholder="Add follow-up note..." required
                className="flex-1 rounded-lg border border-border px-3 py-1.5 text-sm focus:border-primary outline-none bg-card" />
              <button type="submit" className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white hover:bg-primary-hover">Add</button>
            </form>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-primary mb-3">Internal Notes</h2>
            <form action={handleUpdateNotes}>
              <input type="hidden" name="id" value={quote.id} />
              <textarea name="notes" rows={3} defaultValue={quote.notes}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary outline-none bg-card resize-y mb-2"
                placeholder="Internal notes about this lead..." />
              <button type="submit" className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface">Save Notes</button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-primary mb-3">Status</h2>
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              quote.status === 'won' ? 'bg-green-50 text-green-700' :
              quote.status === 'lost' ? 'bg-red-50 text-red-700' :
              quote.status === 'pending' ? 'bg-amber-50 text-amber-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {STATUS_LABELS[quote.status] || quote.status}
            </span>

            {/* Quick actions */}
            {nextActions[quote.status]?.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted">Quick Actions:</p>
                {nextActions[quote.status].map(next => (
                  <form key={next} action={handleStatusUpdate} className="inline-block mr-2">
                    <input type="hidden" name="id" value={quote.id} />
                    <input type="hidden" name="status" value={next} />
                    <button type="submit" className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition ${
                      next === 'won' ? 'bg-green-600' : next === 'lost' ? 'bg-red-600' : 'bg-primary'
                    }`}>
                      Mark {STATUS_LABELS[next]}
                    </button>
                  </form>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-primary mb-3">Timeline</h2>
            <div className="space-y-2 text-xs text-muted">
              <div className="flex justify-between">
                <span>Created</span>
                <span>{new Date(quote.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span>{new Date(quote.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Follow-ups</span>
                <span>{followUps.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
