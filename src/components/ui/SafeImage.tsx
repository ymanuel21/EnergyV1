'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { COMING_SOON_SRC, COMING_SOON_ALT, isPlaceholderImage } from '@/lib/image-placeholders';

export type SafeImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string;
};

function isDataUrl(src: string): boolean {
  if (!src) return false;
  return src.startsWith('data:') || src.startsWith('blob:');
}

/**
 * next/image wrapper that never renders a blank or broken box.
 *
 * Two distinct "no photo" cases are handled centrally so every caller behaves the same:
 *  - `src` is empty/whitespace (no asset was ever attached). Passing `''` to next/image
 *    throws, which is what previously left a bare grey container;
 *  - the image fails to load (`onError`).
 *
 * Both resolve to the approved "Coming Soon" graphic. If the placeholder itself ever
 * failed, `hasError` is already true, so `setHasError(true)` is a no-op — there is no
 * retry loop.
 */
export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => { setHasError(false); }, [src]);

  // "No real photo" now also covers the legacy grey sentinel that the admin form used to
  // write into products.images — it is a loadable file, so onError never fires for it.
  const missing = isPlaceholderImage(src);
  const showPlaceholder = missing || hasError;
  const resolvedSrc = showPlaceholder ? COMING_SOON_SRC : src;
  const resolvedAlt = showPlaceholder ? COMING_SOON_ALT : alt;

  // Data URLs and blob URLs need unoptimized — next/image can't optimize them
  // since there's no origin server
  const unoptimized = isDataUrl(resolvedSrc) ? true : undefined;

  return (
    <Image
      src={resolvedSrc}
      alt={resolvedAlt}
      onError={() => setHasError(true)}
      unoptimized={unoptimized}
      {...props}
    />
  );
}
