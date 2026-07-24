'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

const PLACEHOLDER = '/images/placeholder/product-placeholder.png';

export type SafeImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string;
};

function isDataUrl(src: string): boolean {
  return src.startsWith('data:') || src.startsWith('blob:');
}

export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

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
