'use client';

import { useState } from 'react';
import { ImageGallery } from '@/app/admin/products/ImageGallery';

interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
  order: number;
}

export function ProjectMediaPanel({
  defaultCoverImage,
  defaultImages,
}: {
  defaultCoverImage: string;
  defaultImages: string[];
}) {
  const [cover, setCover] = useState(defaultCoverImage);
  const [gallery, setGallery] = useState<string[]>(defaultImages || []);

  const moveUp = (i: number) => {
    if (i === 0) return;
    setGallery(prev => {
      const next = [...prev];
      [next[i - 1], next[i]] = [next[i], next[i - 1]];
      return next;
    });
  };

  const moveDown = (i: number) => {
    if (i === gallery.length - 1) return;
    setGallery(prev => {
      const next = [...prev];
      [next[i], next[i + 1]] = [next[i + 1], next[i]];
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          Cover Image <span className="text-xs text-muted">(Hero)</span>
        </label>
        <ImageGallery images={cover ? [cover] : []} onChange={imgs => setCover(imgs[0] || '')} />
        <input type="hidden" name="coverImage" value={cover} />
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-primary">
            Gallery Images <span className="text-xs text-muted">({gallery.length})</span>
          </label>
          <span className="text-xs text-muted">Drag to reorder or use arrows ↓</span>
        </div>
        <ImageGallery images={gallery} onChange={setGallery} />
        <input type="hidden" name="images" value={JSON.stringify(gallery)} />

        {/* Reorder controls */}
        {gallery.length > 1 && (
          <div className="mt-2 space-y-1">
            {gallery.map((url, i) => (
              <div key={i} className="flex items-center gap-2 rounded border border-border px-3 py-2 bg-card">
                <img src={url} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
                <span className="flex-1 text-xs text-muted truncate">{url}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
                    className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:bg-surface transition disabled:opacity-30">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveDown(i)} disabled={i === gallery.length - 1}
                    className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:bg-surface transition disabled:opacity-30">
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
