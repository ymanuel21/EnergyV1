'use client';

import { useState, useEffect, useCallback } from 'react';

interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

interface LightboxProps {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const current = images[index];

  const goNext = useCallback(() => setIndex(i => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setIndex(i => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose} role="dialog" aria-label="Image gallery">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition"
        aria-label="Close gallery">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition"
          aria-label="Previous image">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}

      {/* Image */}
      <div className="max-h-[80vh] max-w-[90vw] flex flex-col items-center" onClick={e => e.stopPropagation()}>
        <img src={current.url} alt={current.alt || current.caption || ''}
          className="max-h-[70vh] max-w-full object-contain rounded-lg" />
        {current.caption && (
          <p className="mt-3 text-sm text-white/70 text-center">{current.caption}</p>
        )}
        <p className="mt-2 text-xs text-white/40">{index + 1} / {images.length}</p>
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition"
          aria-label="Next image">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
    </div>
  );
}

export function PhotoGallery({ images, title }: { images: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Parse images: support both string[] and [{url, caption, alt}]
  const parsed: GalleryImage[] = images.map((img: any) => {
    if (typeof img === 'string') return { url: img, alt: `${title} photo` };
    return { url: img.url || img, alt: img.alt || '', caption: img.caption || '' };
  });

  if (parsed.length === 0) return null;

  return (
    <>
      <div className="mt-3">
        {/* Photo count */}
        <p className="text-xs text-muted mb-2">📷 {parsed.length} Photos</p>

        {/* Grid */}
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {parsed.map((img, i) => (
            <button key={i} onClick={() => setLightbox(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50">
              <img src={img.url} alt={img.alt}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white truncate">{img.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <Lightbox images={parsed} initialIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </>
  );
}
