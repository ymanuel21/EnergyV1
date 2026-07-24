'use client';

import { useState } from 'react';
import { cn } from '@lib/utils/cn';
import { Modal } from '@ui/Modal';
import { SafeImage } from '@ui/SafeImage';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  if (!images.length) {
    return (
      <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">Tidak ada gambar</span>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <button
        onClick={() => setZoomOpen(true)}
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100"
        aria-label={`${productName} — Klik untuk zoom`}
      >
        <SafeImage
          src={images[selected]}
          alt={productName}
          width={800}
          height={800}
          priority
          className="h-full w-full object-cover transition hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          Klik untuk zoom
        </span>
      </button>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === selected ? 'border-brand-600' : 'border-gray-200 hover:border-gray-400'
              )}
            >
              <SafeImage
                src={img}
                alt={`${productName} ${i + 1}`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                loading="lazy"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} size="lg" showCloseButton>
        <div className="relative">
          <SafeImage
            src={images[selected]}
            alt={productName}
            width={1200}
            height={1200}
            className="w-full h-auto rounded-lg"
            sizes="90vw"
          />
        </div>
      </Modal>
    </div>
  );
}
