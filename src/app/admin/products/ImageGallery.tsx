'use client';

import { useState, useCallback } from 'react';

interface ImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const [newUrl, setNewUrl] = useState('');

  const move = useCallback((from: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  }, [images, onChange]);

  const remove = useCallback((i: number) => {
    onChange(images.filter((_, idx) => idx !== i));
  }, [images, onChange]);

  const add = useCallback(() => {
    const url = newUrl.trim();
    if (!url) return;
    onChange([...images, url]);
    setNewUrl('');
  }, [images, newUrl, onChange]);

  return (
    <div className="space-y-3">
      {/* Gallery grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <div key={`${url}-${i}`} className="relative group rounded-lg border border-border overflow-hidden bg-surface">
              <img src={url} alt="" className="w-full aspect-square object-cover" />
              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button type="button" onClick={() => move(i, 'up')} disabled={i === 0}
                  className="bg-white/90 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-700 hover:bg-white disabled:opacity-30"
                  title="Move up">↑</button>
                <button type="button" onClick={() => move(i, 'down')} disabled={i === images.length - 1}
                  className="bg-white/90 rounded px-1.5 py-0.5 text-[10px] font-medium text-gray-700 hover:bg-white disabled:opacity-30"
                  title="Move down">↓</button>
                <button type="button" onClick={() => remove(i)}
                  className="bg-white/90 rounded px-1.5 py-0.5 text-[10px] font-medium text-red-600 hover:bg-red-50"
                  title="Remove">✕</button>
              </div>
              {/* Position indicator */}
              <span className="absolute top-1 left-1 bg-black/60 text-white rounded px-1.5 py-0.5 text-[9px]">{i + 1}</span>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <p className="text-xs text-muted py-4 text-center">No images yet. Add images below.</p>
      )}

      {/* Add image */}
      <div className="flex gap-2">
        <input type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Paste image URL or use Media Library →"
          className="flex-1 rounded border border-border px-2.5 py-1.5 text-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-card" />
        <button type="button" onClick={() => window.open('/admin/media', '_blank')}
          className="rounded border border-border px-3 py-1.5 text-xs text-muted hover:text-primary hover:bg-surface transition shrink-0">
          Media Library
        </button>
        <button type="button" onClick={add}
          className="rounded bg-primary px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-hover transition shrink-0">
          Add
        </button>
      </div>
    </div>
  );
}
