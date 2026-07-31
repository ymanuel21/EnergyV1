'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';

const PLACEHOLDER = '/images/placeholder/product-placeholder.png';

export type SafeImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string;
};

function isDataUrl(src: string): boolean {
  if (!src) return false;
  return src.startsWith('data:') || src.startsWith('blob:');
}

export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  
  // Reset error state when src changes
  useEffect(() => { setHasError(false); }, [src]);

  // Data URLs and blob URLs need unoptimized — next/image
  // can't optimize them since there's no origin server
  if (isDataUrl(src) || isDataUrl(hasError ? PLACEHOLDER : src)) {
    return (
      <Image
        src={hasError ? PLACEHOLDER : src}
        alt={alt}
        onError={() => setHasError(true)}
        unoptimized
        {...props}
      />
    );
  }

  return (
    <Image
      src={hasError ? PLACEHOLDER : src}
      alt={alt}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
