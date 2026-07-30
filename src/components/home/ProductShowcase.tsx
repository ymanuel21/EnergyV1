'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TrustPanel } from './TrustPanel';
import Link from 'next/link';
import { SafeImage } from '@ui/SafeImage';

// Highlight keys for key specs display
const KEY_SPECS = ['Daya Output', 'Power Output', 'Watt Peak', 'Rating', 'Tipe', 'Type', 'Kapasitas', 'Capacity', 'Tegangan', 'Voltage'];

function getHighlights(specs?: Array<{ key: string; value: string }>) {
  if (!specs?.length) return [];
  return specs.filter(s => KEY_SPECS.some(k => s.key.toLowerCase().includes(k.toLowerCase()))).slice(0, 3);
}

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
  const p = products[activeIndex] || products[0];
  const highlights = getHighlights(p?.specifications);
  const isSingle = count === 1;

  const next = useCallback(() => setActiveIndex(prev => (prev + 1) % count), [count]);
  const prev = useCallback(() => setActiveIndex(prev => (prev - 1 + count) % count), [count]);

  // Auto-rotation (2+ products, not hovered)
  useEffect(() => {
    if (count < 2 || isHovered) {
      if (autoTimer.current) clearInterval(autoTimer.current);
      return;
    }
    autoTimer.current = setInterval(next, 8000);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [count, isHovered, next]);

  // Swipe
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (diff > 50) prev();
    else if (diff < -50) next();
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
      {/* LEFT — Product Card */}
      <div className={`relative ${isSingle ? 'lg:w-[60%]' : 'lg:w-[55%]'}`}>
        {!isSingle && (
          <>
            <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-3 h-10 w-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center hover:bg-surface transition">
              ◀
            </button>
            <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-3 h-10 w-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center hover:bg-surface transition">
              ▶
            </button>
          </>
        )}

        <Link href={`/produk/${p?.slug || ''}`}
          className={`group rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition block ${isSingle ? 'flex flex-col sm:flex-row' : ''}`}>
          <div className={`overflow-hidden bg-surface ${isSingle ? 'sm:w-[50%] aspect-square sm:aspect-auto sm:h-full' : 'aspect-square'}`}>
            <SafeImage src={p?.images?.[0] || ''} alt={p?.name || ''} width={400} height={400}
              className="h-full w-full object-contain p-4 group-hover:scale-105 transition duration-500" />
          </div>

          <div className={`p-5 ${isSingle ? 'sm:w-[50%] flex flex-col justify-center' : ''}`}>
            <h3 className={`font-medium text-primary line-clamp-2 ${isSingle ? 'text-lg' : 'text-base'}`}>{p?.name}</h3>

            {(p?.shortDescription || p?.description) && (
              <p className="mt-2 text-xs text-muted line-clamp-3 leading-relaxed">
                {p.shortDescription || p.description}
              </p>
            )}

            {showPrice && (
              <div className="mt-3 flex items-baseline gap-2">
                {priceLabels.get(p?.id) ? (
                  <span className="text-sm text-muted font-medium">{priceLabels.get(p.id)}</span>
                ) : (
                  <>
                    <span className={`font-semibold ${isSingle ? 'text-xl' : 'text-lg'}`}>Rp {p?.price?.toLocaleString('id-ID')}</span>
                    {p?.originalPrice > p?.price && (
                      <span className="text-xs text-muted line-through">Rp {p.originalPrice?.toLocaleString('id-ID')}</span>
                    )}
                  </>
                )}
              </div>
            )}

            {highlights.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {highlights.map((h: any, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted">
                    <span className="font-medium text-primary">{h.value}</span>
                    <span className="opacity-60">{h.key}</span>
                  </span>
                ))}
              </div>
            )}

            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline w-fit">
              Lihat Detail
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </span>
          </div>
        </Link>

        {!isSingle && (
          <div className="flex justify-center gap-1.5 mt-4">
            {products.map((_, i) => (
              <button key={i} onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-muted'}`} />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — Trust Panel (LOCKED — do not change) */}
      <div className={`${isSingle ? 'lg:w-[40%]' : 'lg:w-[45%]'} lg:min-w-[320px]`}>
        <TrustPanel />
      </div>
    </div>
  );
}
