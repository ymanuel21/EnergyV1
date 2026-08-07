export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getAdminPrisma } from './lib/admin-prisma';
import { aggregateMediaDatabase, countUniqueAssets } from '@/lib/services/media';

const PIPELINE_STATUSES = ['pending', 'contacted', 'survey_scheduled', 'proposal_sent'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  contacted: 'Contacted',
  survey_scheduled: 'Survey',
  proposal_sent: 'Proposal',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '📥',
  contacted: '📞',
  survey_scheduled: '📋',
  proposal_sent: '📄',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-l-amber-400',
  contacted: 'border-l-blue-400',
  survey_scheduled: 'border-l-purple-400',
  proposal_sent: 'border-l-indigo-400',
};

async function getStats() {
  try {
    const prisma = await getAdminPrisma();
    const [products, categories, brands, articles, faqs, sections, navLinks] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.brand.count(),
      prisma.article.count(),
      prisma.faq.count(),
      prisma.homepageSectionVersion.count({ where: { status: 'published' } }),
      prisma.navigationLink.count({ where: { enabled: true } }),
    ]);
    const mediaItems = await aggregateMediaDatabase(prisma);
    const assets = countUniqueAssets(mediaItems);
    return { products, categories, brands, articles, faqs, sections, navLinks, assets };
  } catch {
    return null;
  }
}

async function getQuoteStats() {
  try {
    const prisma = await getAdminPrisma();
    // Single groupBy query for all active pipeline statuses
    const groups = await prisma.quoteRequest.groupBy({
      by: ['status'],
      where: { status: { in: [...PIPELINE_STATUSES] } },
      _count: { status: true },
    });

    const counts: Record<string, number> = {};
    for (const g of groups) {
      counts[g.status] = g._count.status;
    }
    // Ensure all pipeline statuses have at least 0
    for (const s of PIPELINE_STATUSES) {
      counts[s] = counts[s] || 0;
    }
    return counts;
  } catch {
    return null;
  }
}

async function getRecentQuotes() {
  try {
    const prisma = await getAdminPrisma();
    return prisma.quoteRequest.findMany({
      where: { status: { in: [...PIPELINE_STATUSES] } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const stats = await getStats();
  const quoteStats = await getQuoteStats();
  const recentQuotes = await getRecentQuotes();

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Selamat datang di EBTPlaza Admin</p>

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          <Card label="Produk" value={stats.products} href="/admin/products" />
          <Card label="Kategori" value={stats.categories} href="/admin/categories" />
          <Card label="Brand" value={stats.brands} href="/admin/brands" />
          <Card label="Artikel" value={stats.articles} href="/admin/articles" />
          <Card label="FAQ" value={stats.faqs} href="/admin/faq" />
          <Card label="Homepage Sections" value={stats.sections} href="/admin/homepage" />
          <Card label="Nav Links" value={stats.navLinks} href="/admin/navigation" />
          <Card label="Media Assets" value={stats.assets} href="/admin/media" />
        </div>
      )}

      {!stats && (
        <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-muted">Database connection unavailable. Stats will appear when connected.</p>
        </div>
      )}

      {/* ── Quote Pipeline ── */}
      {quoteStats && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-primary mb-3">Quote Pipeline</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PIPELINE_STATUSES.map(status => (
              <Link
                key={status}
                href={`/admin/quotes?status=${status}`}
                className={`rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow border-l-4 ${STATUS_COLORS[status]}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{STATUS_ICONS[status]}</span>
                  <span className="text-xs font-medium text-muted">{STATUS_LABELS[status]}</span>
                </div>
                <p className="text-2xl font-bold text-primary">{quoteStats[status] || 0}</p>
              </Link>
            ))}
          </div>

          {/* ── Recent Active Quotes ── */}
          {recentQuotes.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-primary mb-3">
                Recent Active Quotes
              </h3>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface/50">
                      <th className="p-3 text-left font-medium text-primary">Customer</th>
                      <th className="p-3 text-left font-medium text-primary hidden sm:table-cell">Company</th>
                      <th className="p-3 text-left font-medium text-primary">Status</th>
                      <th className="p-3 text-left font-medium text-primary hidden md:table-cell">Created</th>
                      <th className="p-3 text-left font-medium text-primary hidden lg:table-cell">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQuotes.map((q: any) => (
                      <tr key={q.id} className="border-b border-border/50 hover:bg-surface/50 transition">
                        <td className="p-3">
                          <Link href={`/admin/quotes/${q.id}`} className="font-medium text-primary hover:underline">
                            {q.name}
                          </Link>
                        </td>
                        <td className="p-3 hidden sm:table-cell text-muted">{q.company || '—'}</td>
                        <td className="p-3">
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium bg-surface text-muted">
                            {STATUS_LABELS[q.status] || q.status}
                          </span>
                        </td>
                        <td className="p-3 hidden md:table-cell text-muted text-xs">
                          {new Date(q.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="p-3 hidden lg:table-cell text-muted text-xs">
                          {new Date(q.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-primary">Quick Actions</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/admin/products/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">+ Tambah Produk</Link>
            <Link href="/admin/articles/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">+ Tulis Artikel</Link>
            <Link href="/admin/homepage" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">Homepage Builder</Link>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-primary">Site Management</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/admin/appearance" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">Appearance</Link>
            <Link href="/admin/navigation" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">Navigation</Link>
            <Link href="/admin/settings" className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:bg-surface transition">Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-6 hover:shadow-sm transition-shadow">
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Link>
  );
}
