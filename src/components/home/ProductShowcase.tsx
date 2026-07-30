'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ProductInfoPanel } from './ProductInfoPanel';
import { ProductCardItem } from './ProductCardItem';

interface ProductShowcaseProps {
  products: any[];
  featuredCount: number;
  showPrice: boolean;
  showBadge: boolean;
  priceLabels: Map<string, string | undefined>;
  buttonLabel?: string;
  buttonLink?: string;
}

export function ProductShowcase({ products, featuredCount, ...props }: ProductShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = products.length;
  const activeProduct = products[activeIndex] || products[0];

  const next = useCallback(() => setActiveIndex(prev => (prev + 1) % count), [count]);
  const prev = useCallback(() => setActiveIndex(prev => (prev - 1 + count) % count), [count]);

  // Auto-rotation for 2-3 products
  useEffect(() => {
    if (count < 2 || isHovered) {
      if (autoTimer.current) clearInterval(autoTimer.current);
      return;
    }
    autoTimer.current = setInterval(next, 5000);
    return () => { if (autoTimer.current) clearInterval(autoTimer.current); };
  }, [count, isHovered, next]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (diff > 60) prev();
    else if (diff < -60) next();
    setTouchStart(null);
  };

  return (
    <div
      className={`flex flex-col lg:flex-row gap-8 ${count > 1 ? 'cursor-pointer' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left: Product card with rotation controls */}
      <div className={`relative ${count === 1 ? 'lg:w-[58%]' : 'lg:w-[52%]'}`}>
        {/* Navigation arrows (only for 2-3 products) */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-3 h-10 w-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center hover:bg-surface transition"
              aria-label="Previous"
            >
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-3 h-10 w-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center hover:bg-surface transition"
              aria-label="Next"
            >
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}

        {/* Product card */}
        <ProductCardItem
          product={activeProduct}
          showPrice={props.showPrice}
          showBadge={props.showBadge}
          priceLabels={props.priceLabels}
          featuredCount={count}
        />

        {/* Dot indicators */}
        {count > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-border hover:bg-muted'}`}
                aria-label={`Product ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Info Panel */}
      <div className={`${count === 1 ? 'lg:w-[42%]' : 'lg:w-[48%]'} lg:min-w-[340px]`}>
        <ProductInfoPanel product={activeProduct} />
      </div>
    </div>
  );
}
