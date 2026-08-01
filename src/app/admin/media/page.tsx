export const dynamic = 'force-dynamic';

import { getMediaDatabase } from './actions';
import { MediaBrowser } from './MediaBrowser';

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const items = await getMediaDatabase(params.q);

  // Group by source for filter tabs
  const counts = { all: items.length, product: 0, project: 0, brand: 0, banner: 0, testimonial: 0, homepage: 0 };
  items.forEach(i => { if (counts[i.source as keyof typeof counts] !== undefined) (counts as any)[i.source]++; });

  // Deduplicate by URL for display
  const seen = new Set<string>();
  const unique = items.filter(i => { if (seen.has(i.url)) return false; seen.add(i.url); return true; });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Media Library</h1>
          <p className="text-sm text-muted mt-1">{unique.length} unique assets · {items.length} total references</p>
        </div>
      </div>

      <form className="mb-4">
        <input name="q" defaultValue={params.q || ''} placeholder="Cari berdasarkan nama file, URL, atau nama produk/proyek..."
          className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
      </form>

      {/* Source counts */}
      <div className="flex gap-2 mb-4 flex-wrap text-xs">
        {Object.entries(counts).map(([key, count]) => (
          <span key={key} className={`rounded-full px-3 py-1 border ${key === 'all' ? 'bg-primary text-white border-primary' : 'border-border text-muted'}`}>
            {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}: {count}
          </span>
        ))}
      </div>

      <MediaBrowser items={unique} />
    </div>
  );
}
