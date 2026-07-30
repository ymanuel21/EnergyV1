'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { SafeImage } from '@ui/SafeImage';
import { TrustPanel } from './TrustPanel';
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
  const showRealPrice = !label;

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
      className="flex flex-col lg:flex-row gap-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* LEFT — Product Showcase (≈70%) */}
      <div className="flex-1 lg:w-[70%] relative">
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

        {/* Shared spotlight card — image left, info right, equal height */}
        <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            {/* Image — stretches to match right panel via items-stretch */}
            <div className="sm:w-[48%] bg-surface flex items-center justify-center p-6 sm:p-8 aspect-square sm:aspect-auto sm:h-auto">
              <SafeImage src={active?.images?.[0] || ''} alt={active?.name || ''} width={500} height={500}
                className="h-full w-full object-contain group-hover:scale-105 transition duration-500 sm:max-h-full" />
            </div>

            {/* Info — 52%, flex column, CTA at bottom */}
            <div className="sm:w-[52%] p-5 sm:p-6 flex flex-col min-h-0">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-1">{active?.name}</h3>

              {showPrice && (
                <div className="flex items-baseline gap-2 mb-2">
                  {label ? (
                    <span className="text-base text-muted font-medium">{label}</span>
                  ) : (
                    <>
                      <span className="text-xl sm:text-2xl font-bold text-primary">Rp {active?.price?.toLocaleString('id-ID')}</span>
                      {active?.originalPrice > active?.price && (
                        <span className="text-sm text-muted line-through">Rp {active?.originalPrice?.toLocaleString('id-ID')}</span>
                      )}
                    </>
                  )}
                </div>
              )}

              {(active?.shortDescription || active?.description) && (
                <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-3">
                  {active.shortDescription || active.description}
                </p>
              )}

              {/* Tabbed info — flex-grow pushes CTA to bottom */}
              <div className="flex-1 min-h-0">
                <ProductInfoPanel product={active} />
              </div>

              <Link
                href={`/produk/${active?.slug || ''}`}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors w-fit"
              >
                Lihat Detail Produk
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
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

      {/* RIGHT — Trust Panel LOCKED (≈30%) */}
      <div className="lg:w-[30%] lg:min-w-[300px]">
        <TrustPanel />
      </div>
    </div>
  );
}
