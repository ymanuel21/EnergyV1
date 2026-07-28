export const dynamic = 'force-dynamic';

import { getAssets, getAssetUsage, deleteAsset } from './actions';
import { revalidatePath } from 'next/cache';
import { MediaBrowser } from './MediaBrowser';

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const assets = await getAssets(params.q);

  async function handleDelete(assetId: string) {
    'use server';
    const result = await deleteAsset(assetId);
    revalidatePath('/admin/media');
    return result;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Media Library</h1>
          <p className="text-sm text-muted mt-1">{assets.length} assets</p>
        </div>
      </div>

      <form className="mb-4">
        <input name="q" defaultValue={params.q || ''} placeholder="Search by filename..."
          className="w-full rounded-lg border border-border px-4 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
      </form>

      <MediaBrowser assets={assets} onDelete={handleDelete} />
    </div>
  );
}
