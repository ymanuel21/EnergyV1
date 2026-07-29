'use client';

import { useEffect } from 'react';

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, eventType: 'VIEW' }),
    }).catch(() => {});
  }, [productId]);
  return null;
}

export function trackEvent(eventType: string, productId: string, metadata?: Record<string, any>) {
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, eventType, metadata }),
  }).catch(() => {});
}
