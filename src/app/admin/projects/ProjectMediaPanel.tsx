'use client';

import { ImageGallery } from '@/app/admin/products/ImageGallery';

interface ProjectMediaPanelProps {
  coverImage: string;
  onCoverImageChange: (value: string) => void;
  images: string[];
  onImagesChange: (value: string[]) => void;
}

/**
 * Controlled media panel for project cover + gallery.
 * State is owned by the parent (ProjectEditForm reducer), not by this component.
 */
export function ProjectMediaPanel({
  coverImage,
  onCoverImageChange,
  images,
  onImagesChange,
}: ProjectMediaPanelProps) {
  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...images];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onImagesChange(next);
  };

  const moveDown = (i: number) => {
    if (i === images.length - 1) return;
    const next = [...images];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onImagesChange(next);
  };

  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          Cover Image <span className="text-xs text-muted">(Hero)</span>
        </label>
        <ImageGallery images={coverImage ? [coverImage] : []} onChange={imgs => onCoverImageChange(imgs[0] || '')} />
      </div>

      {/* Gallery */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-primary">
            Gallery Images <span className="text-xs text-muted">({images.length})</span>
          </label>
          <span className="text-xs text-muted">Drag to reorder or use arrows ↓</span>
        </div>
        <ImageGallery images={images} onChange={onImagesChange} />

        {/* Reorder controls */}
        {images.length > 1 && (
          <div className="mt-2 space-y-1">
            {images.map((url, i) => (
              <div key={`${url}-${i}`} className="flex items-center gap-2 rounded border border-border px-3 py-2 bg-card">
                <img src={url} alt="" className="h-10 w-10 rounded object-cover shrink-0 bg-surface" />
                <span className="flex-1 text-xs text-muted truncate">{url}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveUp(i)} disabled={i === 0}
                    className="rounded border border-border px-2 py-0.5 text-xs text-muted hover:bg-surface transition disabled:opacity-30">
                    ↑
                  </button>
                  <button type="button" onClick={() => moveDown(i)} disabled={i === images.length - 1}
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
