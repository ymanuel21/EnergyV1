'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeImage } from '@ui/SafeImage';
import { ProductInfoPanel } from './ProductInfoPanel';
import Link from 'next/link';

interface ProductShowcaseProps {
  products: any[];
  showPrice: boolean;
  showBadge: boolean;
  priceLabels: Map<string, string | undefined>;
}

export function ProductShowcase({ products, showPrice, showBadge, priceLabels }: ProductShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = products.length;
  const active = products[activeIndex] || products[0];
  const isSingle = count === 1;
  const label = priceLabels.get(active?.id);

  const next = useCallback(() => setActiveIndex(prev => (prev + 1) % count), [count]);
  const prev = useCallback(() => setActiveIndex(prev => (prev - 1 + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || isHovered) { if (autoTimer.current) clearInterval(autoTimer.current); return; }
    autoTimer.current = setInterval(next, 8000);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [count, isHovered, next]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (diff > 50) prev(); else if (diff < -50) next();
    setTouchStart(null);
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isSingle && (
        <>
          <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 h-10 w-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center hover:bg-surface transition">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 h-10 w-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center hover:bg-surface transition">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </>
      )}

      {/* Full-width product card */}
      <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          {/* Image — clickable */}
          <Link href={`/produk/${active?.slug || ''}`}
            className={`bg-surface flex items-center justify-center p-6 sm:p-8 ${isSingle ? 'sm:w-[48%]' : 'sm:w-[42%]'} aspect-square sm:aspect-auto sm:h-auto`}>
            <SafeImage src={active?.images?.[0] || ''} alt={active?.name || ''} width={500} height={500}
              className="h-full w-full object-contain group-hover:scale-105 transition duration-500 sm:max-h-full" />
          </Link>

          {/* Info */}
          <div className={`${isSingle ? 'sm:w-[52%]' : 'sm:w-[58%]'} p-5 sm:p-6 flex flex-col`}>
            <Link href={`/produk/${active?.slug || ''}`} className="hover:underline">
              <h3 className={`font-semibold text-primary ${isSingle ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>{active?.name}</h3>
            </Link>

            {showPrice && (
              <div className="flex items-baseline gap-2 mt-2">
                {label ? (
                  <span className="text-base text-muted font-medium">{label}</span>
                ) : (
                  <>
                    <span className={`font-bold text-primary ${isSingle ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
                      Rp {active?.price?.toLocaleString('id-ID')}
                    </span>
                    {active?.originalPrice > active?.price && (
                      <span className="text-sm text-muted line-through">Rp {active?.originalPrice?.toLocaleString('id-ID')}</span>
                    )}
                  </>
                )}
              </div>
            )}

            {(active?.shortDescription || active?.description) && (
              <p className="text-sm text-muted line-clamp-3 leading-relaxed mt-2">
                {active.shortDescription || active.description}
              </p>
            )}

            {/* Tabs: Description | Spesifikasi | Pengiriman & Garansi */}
            <div className="flex-1 min-h-0 mt-3">
              <ProductInfoPanel product={active} />
            </div>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline w-fit">
              Lihat Detail
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {!isSingle && (
        <div className="flex justify-center gap-1.5 mt-4">
          {products.map((_, i) => (
            <button key={i} onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-muted'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
