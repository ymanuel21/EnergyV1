'use client';

import { useState } from 'react';

export function MediaBrowser({ assets, onDelete }: { assets: any[]; onDelete: (id: string) => Promise<{ success: boolean; message: string }> }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [usages, setUsages] = useState<string[]>([]);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const r = await onDelete(id);
    setDeleteMsg(r.message);
    setTimeout(() => setDeleteMsg(null), 3000);
  }

  function handleCopy(id: string) {
    const url = `${window.location.origin}/api/asset/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setDeleteMsg('URL copied!');
      setTimeout(() => setDeleteMsg(null), 2000);
    });
  }

  if (!assets.length) return <p className="text-muted text-sm py-8 text-center">No assets yet. Upload via Products, Banners, or Brand editors.</p>;

  return (
    <div>
      {deleteMsg && (
        <div className="mb-3 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">{deleteMsg}</div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {assets.map((a: any) => (
          <div key={a.id} className={`rounded-lg border bg-card overflow-hidden transition cursor-pointer ${selected === a.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            onClick={() => setSelected(selected === a.id ? null : a.id)}>
            <div className="aspect-square flex items-center justify-center bg-surface">
              <img src={`/api/asset/${a.id}`} alt={a.filename} className="max-h-full max-w-full object-contain p-2" />
            </div>
            <div className="p-2">
              <p className="text-xs text-muted truncate">{a.filename || a.id.substring(0, 8)}</p>
              <p className="text-[10px] text-muted/60">{Math.round(a.size / 1024)}KB · {a.mimeType?.replace('image/', '')}</p>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-4 rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => handleCopy(selected)} className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface">Copy URL</button>
            <button onClick={() => handleDelete(selected)} className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
            <a href={`/api/asset/${selected}`} target="_blank" className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:bg-surface">View</a>
          </div>
        </div>
      )}
    </div>
  );
}
