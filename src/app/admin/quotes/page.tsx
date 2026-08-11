export const dynamic = 'force-dynamic';

import { getAdminPrisma } from '../lib/admin-prisma';
import Link from 'next/link';
import { CopyIdButton } from '@/components/admin/CopyIdButton';

const STATUSES = ['pending', 'contacted', 'survey_scheduled', 'proposal_sent', 'won', 'lost'] as const;
const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending', contacted: 'Contacted', survey_scheduled: 'Survey',
  proposal_sent: 'Proposal', won: 'Won', lost: 'Lost',
};
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  contacted: 'bg-blue-50 text-blue-700',
  survey_scheduled: 'bg-purple-50 text-purple-700',
  proposal_sent: 'bg-indigo-50 text-indigo-700',
  won: 'bg-green-50 text-green-700',
  lost: 'bg-red-50 text-red-700',
};

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const params = await searchParams;
  const activeStatus = params.status || 'all';
  const search = params.search || '';

  const prisma = await getAdminPrisma();
  const allQuotes = await prisma.quoteRequest.findMany({ orderBy: { createdAt: 'desc' } });

  let quotes = allQuotes;
  if (activeStatus !== 'all') {
    quotes = quotes.filter((q: any) => q.status === activeStatus);
  }
  if (search) {
    const q = search.toLowerCase();
    quotes = quotes.filter((r: any) =>
      r.name.toLowerCase().includes(q) ||
      r.company.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q)
    );
  }

  const counts: Record<string, number> = {};
  for (const s of STATUSES) counts[s] = allQuotes.filter((q: any) => q.status === s).length;
  counts.all = allQuotes.length;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-primary mb-4">Quote Requests</h1>

      <div className="flex gap-1 border-b border-border pb-3 mb-4 overflow-x-auto">
        {[{ value: 'all', label: 'All' }, ...STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] }))].map(tab => (
          <Link
            key={tab.value}
            href={`/admin/quotes?status=${tab.value}${search ? `&search=${search}` : ''}`}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition whitespace-nowrap ${
              activeStatus === tab.value
                ? 'bg-primary text-white'
                : 'text-muted hover:text-primary hover:bg-surface'
            }`}
          >
            {tab.label} ({counts[tab.value] || 0})
          </Link>
        ))}
      </div>

      <form className="mb-4">
        <input type="hidden" name="status" value={activeStatus} />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name, company, or email..."
          className="w-full max-w-xs rounded-lg border border-border px-3 py-1.5 text-xs focus:border-primary outline-none bg-card"
        />
      </form>

      <div className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left font-medium text-primary">Quote ID</th>
              <th className="p-3 text-left font-medium text-primary">Customer</th>
              <th className="p-3 text-left font-medium text-primary hidden md:table-cell">Company</th>
              <th className="p-3 text-left font-medium text-primary hidden md:table-cell">Contact</th>
              <th className="p-3 text-left font-medium text-primary">Status</th>
              <th className="p-3 text-left font-medium text-primary hidden lg:table-cell">Date</th>
              <th className="p-3 text-right font-medium text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q: any) => (
              <tr key={q.id} className="border-b border-border/50 hover:bg-surface/50 transition group">
                <td className="p-3">
                  <span className="inline-flex items-center gap-1">
                    <span className="font-mono text-[10px] text-muted" title={q.id}>
                      {q.id.substring(0, 8)}…
                    </span>
                    <CopyIdButton id={q.id} />
                  </span>
                </td>
                <td className="p-3 font-medium text-primary">{q.name}</td>
                <td className="p-3 hidden md:table-cell text-muted">{q.company || '—'}</td>
                <td className="p-3 hidden md:table-cell text-muted text-xs">
                  {q.email && <div>{q.email}</div>}
                  {q.phone && <div>{q.phone}</div>}
                </td>
                <td className="p-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[q.status] || ''}`}>
                    {STATUS_LABELS[q.status] || q.status}
                  </span>
                </td>
                <td className="p-3 hidden lg:table-cell text-muted text-xs">
                  {new Date(q.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </td>
                <td className="p-3 text-right">
                  <Link href={`/admin/quotes/${q.id}`} className="text-sm text-primary hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr><td colSpan={7} className="p-8 text-center text-muted">No quotes found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
