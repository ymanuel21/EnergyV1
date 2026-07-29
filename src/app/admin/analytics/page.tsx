export const dynamic = 'force-dynamic';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

export default async function ProductAnalyticsPage() {
  await requireAuth();
  const prisma = await getAdminPrisma();

  // Aggregate events per product
  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, brand: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Get total counts
  const [totalViews, totalRfqs, totalDownloads, totalCompares] = await Promise.all([
    prisma.productEvent.count({ where: { eventType: 'VIEW' } }),
    prisma.productEvent.count({ where: { eventType: { in: ['RFQ_START', 'RFQ_SUBMIT'] } } }),
    prisma.productEvent.count({ where: { eventType: 'DOWNLOAD' } }),
    prisma.productEvent.count({ where: { eventType: 'COMPARE_ADD' } }),
  ]);

  // Get per-product stats
  const productStats = await Promise.all(
    allProducts.slice(0, 50).map(async (p) => {
      const [views, rfqs, compares] = await Promise.all([
        prisma.productEvent.count({ where: { productId: p.id, eventType: 'VIEW' } }),
        prisma.productEvent.count({ where: { productId: p.id, eventType: { in: ['RFQ_START', 'RFQ_SUBMIT'] } } }),
        prisma.productEvent.count({ where: { productId: p.id, eventType: 'COMPARE_ADD' } }),
      ]);
      return { ...p, views, rfqs, compares };
    })
  );

  // Sort by views desc
  productStats.sort((a, b) => b.views - a.views);

  // Low engagement products: high views but zero RFQs
  const lowEngagement = productStats.filter(p => p.views >= 5 && p.rfqs === 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Product Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Views', value: totalViews, color: 'bg-blue-50 border-blue-200' },
          { label: 'RFQ Requests', value: totalRfqs, color: 'bg-green-50 border-green-200' },
          { label: 'Downloads', value: totalDownloads, color: 'bg-amber-50 border-amber-200' },
          { label: 'Comparisons', value: totalCompares, color: 'bg-purple-50 border-purple-200' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border p-5 ${color}`}>
            <p className="text-sm font-medium text-gray-800">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>

      {/* Low Engagement Alerts */}
      {lowEngagement.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-2">⚠ Products Needing Attention</p>
          <p className="text-xs text-amber-700 mb-2">High traffic but no RFQ — may need better specs, images, or downloads.</p>
          <div className="flex flex-wrap gap-2">
            {lowEngagement.slice(0, 6).map(p => (
              <a key={p.id} href={`/admin/products/${p.id}`}
                className="rounded bg-white border border-amber-200 px-3 py-1 text-xs text-amber-800 hover:bg-amber-100 transition">
                {p.name} ({p.views} views)
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Per-product table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium text-right">Views</th>
              <th className="px-4 py-3 font-medium text-right">RFQs</th>
              <th className="px-4 py-3 font-medium text-right">Compared</th>
              <th className="px-4 py-3 font-medium text-right">Conversion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {productStats.map(p => (
              <tr key={p.id} className="hover:bg-surface/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-primary text-xs">{p.name}</p>
                  <p className="text-[10px] text-muted">{p.brand?.name}</p>
                </td>
                <td className="px-4 py-3 text-right text-xs">{p.views}</td>
                <td className="px-4 py-3 text-right text-xs">{p.rfqs}</td>
                <td className="px-4 py-3 text-right text-xs">{p.compares}</td>
                <td className="px-4 py-3 text-right text-xs">
                  {p.views > 0 ? `${((p.rfqs / p.views) * 100).toFixed(1)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productStats.length === 0 && (
          <div className="py-12 text-center text-muted text-sm">No data yet. Analytics will populate as visitors interact with products.</div>
        )}
      </div>
    </div>
  );
}
