export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { getAdminPrisma } from '../../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { QuoteActions } from '../QuoteActions';
import { FollowUpForm, NotesForm } from '../QuoteForms';
import { RequestMessage } from '../RequestMessage';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', contacted: 'Contacted', survey_scheduled: 'Survey Scheduled',
  proposal_sent: 'Proposal Sent', won: 'Won', lost: 'Lost',
};

const NEXT_ACTIONS: Record<string, string[]> = {
  pending: ['contacted'],
  contacted: ['survey_scheduled'],
  survey_scheduled: ['proposal_sent'],
  proposal_sent: ['won', 'lost'],
  won: [],
  lost: [],
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

  const nextActions = NEXT_ACTIONS[quote.status] || [];

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

          {/* Request Details — structured UI */}
          <div className="rounded-xl border border-border bg-card p-6">
            <RequestMessage message={quote.message || ''} />
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

            <FollowUpForm quoteId={quote.id} handleAddNote={handleAddNote} />
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-primary mb-3">Internal Notes</h2>
            <NotesForm quoteId={quote.id} defaultValue={quote.notes || ''} handleUpdateNotes={handleUpdateNotes} />
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

            <QuoteActions
              quoteId={quote.id}
              currentStatus={quote.status}
              nextActions={nextActions}
              handleStatusUpdate={handleStatusUpdate}
            />
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
