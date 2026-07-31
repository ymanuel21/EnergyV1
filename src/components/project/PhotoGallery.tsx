'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

interface GalleryImage {
  url: string;
  alt?: string;
  caption?: string;
}

/* ── Inline loading skeleton ── */
function ImageSkeleton() {
  return <div className="absolute inset-0 animate-pulse bg-white/10 rounded-lg" />;
}

/* ═══ Lightbox ═══ */
function Lightbox({ images, initialIndex, onClose }: { images: GalleryImage[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState(false);
  const touchStartX = useRef(0);
  const current = images[index];

  const goNext = useCallback(() => { setIndex(i => (i + 1) % images.length); setLoaded(false); }, [images.length]);
  const goPrev = useCallback(() => { setIndex(i => (i - 1 + images.length) % images.length); setLoaded(false); }, [images.length]);

  // Keyboard: ← → ESC Home End
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Home') { setIndex(0); setLoaded(false); }
      if (e.key === 'End') { setIndex(images.length - 1); setLoaded(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, goNext, goPrev, images.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose} role="dialog" aria-label="Image gallery"
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? goNext() : goPrev();
      }}
    >
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30 transition" aria-label="Close gallery">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); goPrev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition" aria-label="Previous">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}

      {/* Image + skeleton */}
      <div className="max-h-[80vh] max-w-[90vw] flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
        {!loaded && <ImageSkeleton />}
        <img
          src={current.url}
          alt={current.alt || current.caption || `Photo ${index + 1}`}
          className="max-h-[70vh] max-w-full object-contain rounded-lg"
          onLoad={() => setLoaded(true)}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {current.caption && <p className="mt-3 text-sm text-white/70 text-center">{current.caption}</p>}
        <p className="mt-2 text-xs text-white/40">{index + 1} / {images.length}</p>
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); goNext(); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/20 p-3 text-white hover:bg-white/30 transition" aria-label="Next">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
    </div>
  );
}

/* ═══ Main PhotoGallery component ═══ */
export function PhotoGallery({ images, title }: { images: string[]; title: string }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const parsed: GalleryImage[] = images.map((img: any) => {
    if (typeof img === 'string') return { url: img, alt: `${title} photo` };
    return { url: img.url || img, alt: img.alt || '', caption: img.caption || '' };
  });

  if (parsed.length === 0) return null;

  return (
    <>
      <div className="mt-3">
        <p className="text-xs text-muted mb-2">📷 {parsed.length} Photos</p>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {parsed.map((img, i) => (
            <button key={i} onClick={() => setLightbox(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
