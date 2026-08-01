export const dynamic = 'force-dynamic';

import { getMediaDatabase } from './actions';
import { MediaBrowser } from './MediaBrowser';

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const items = await getMediaDatabase(params.q);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Media Library</h1>
          <p className="text-sm text-muted mt-1">{items.length} total references</p>
        </div>
      </div>

      <form className="mb-4">
        <input name="q" defaultValue={params.q || ''} placeholder="Cari berdasarkan nama file, URL, atau nama produk/proyek..."
          className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
      </form>

      <MediaBrowser items={items} />
    </div>
  );
}
