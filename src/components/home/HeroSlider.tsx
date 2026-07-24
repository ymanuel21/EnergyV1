'use client';

import { useState, useEffect, useCallback } from 'react';
import { SafeImage } from '@ui/SafeImage';
import Link from 'next/link';
import type { Banner } from '@/types/product';

interface HeroSliderProps {
  banners: Banner[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const total = banners.length;

  const goTo = useCallback((i: number) => {
    setCurrent((i + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [total, next]);

  if (!banners.length) return null;

  return (
    <div className="relative overflow-hidden bg-gray-100">
      {banners.map((banner, i) => (
        <Link
          key={i}
          href={banner.href ?? '#'}
          className={`block transition-opacity duration-500 ${
            i === current ? 'opacity-100' : 'absolute inset-0 opacity-0'
          }`}
        >
          <SafeImage
            src={banner.src}
            alt={banner.alt}
            width={banner.width}
            height={banner.height}
            priority={i === 0}
            className="w-full h-auto object-cover"
            sizes="100vw"
          />
        </Link>
      ))}

      {/* Counter */}
      <div className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
        {current + 1}/{total}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ke banner ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-white' : 'w-2 bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
