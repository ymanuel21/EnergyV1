'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { cn } from '@lib/utils/cn';
import { Modal } from '@ui/Modal';
import { SafeImage } from '@ui/SafeImage';
import { PhotoPlaceholder } from '@ui/PhotoPlaceholder';
import { stripPlaceholderImages } from '@/lib/image-placeholders';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const tr = useTranslations();
  const [selected, setSelected] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Drop legacy/grey sentinel entries so they can never appear as gallery images or
  // thumbnails. If nothing real remains, the whole gallery becomes the Coming Soon card.
  const gallery = stripPlaceholderImages(images);

  if (!gallery.length) {
    return (
      <div className="aspect-square overflow-hidden rounded-lg bg-surface">
        <PhotoPlaceholder
          fit="cover"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <button
        onClick={() => setZoomOpen(true)}
        className="relative aspect-square w-full overflow-hidden rounded-lg bg-surface"
        aria-label={`${productName} — Click to zoom`}
      >
        <SafeImage
          src={gallery[selected]}
          alt={productName}
          width={800}
          height={800}
          priority
          className="h-full w-full object-cover transition hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          {tr('product.clickToZoom')}
        </span>
      </button>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                i === selected ? 'border-gray-800' : 'border-border hover:border-gray-400'
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
            src={gallery[selected]}
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
