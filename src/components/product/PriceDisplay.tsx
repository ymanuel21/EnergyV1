// Reusable price display component — single component for ALL price rendering
// Uses centralized resolvePriceDisplay() — never reads settings directly

'use client';

import { useState, useEffect } from 'react';

type PriceDisplayData = {
  mode: string;
  label: string;
  showPrice: boolean;
  cta: string | null;
  ctaHref?: string;
  price?: number;
  originalPrice?: number;
};

interface Props {
  product: {
    price: number;
    originalPrice?: number | null;
    priceDisplayMode?: string | null;
    customPriceLabel?: string | null;
    slug?: string;
  };
  /** Pre-resolved display data (from server component) — avoids client fetch */
  display?: PriceDisplayData;
  /** Show discount badge when originalPrice > price */
  showDiscount?: boolean;
  /** CTA button variant */
  ctaVariant?: 'link' | 'button';
  className?: string;
}

export function PriceDisplay({ product, display, showDiscount, ctaVariant = 'link', className = '' }: Props) {
  const [data, setData] = useState<PriceDisplayData | null>(display || null);

  useEffect(() => {
    if (display) { setData(display); return; }
    // Client-side fetch fallback (for client-only components)
    fetch('/api/pricing-display', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product }),
    })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData(null));
  }, [display, product.price, product.priceDisplayMode]);

  if (!data) return <span className="text-sm text-muted">—</span>;

  const hasDiscount = showDiscount && data.price && data.originalPrice && data.originalPrice > data.price;
  const discount = hasDiscount ? Math.round(((data.originalPrice! - data.price!) / data.originalPrice!) * 100) : 0;

  return (
    <div className={className}>
      {data.showPrice ? (
        <div>
          <span className="text-lg font-bold text-primary">{data.label}</span>
          {hasDiscount && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted line-through">
                Rp {data.originalPrice?.toLocaleString('id-ID')}
              </span>
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                -{discount}%
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">{data.label}</p>
      )}

      {data.cta && (
        ctaVariant === 'button' ? (
          <a href={data.ctaHref || '#'} className="mt-2 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition">
            {data.cta}
          </a>
        ) : (
          <a href={data.ctaHref || '#'} className="text-sm font-medium text-primary hover:underline">
            {data.cta} →
          </a>
        )
      )}
    </div>
  );
}
