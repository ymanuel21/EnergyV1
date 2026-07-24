'use client';

import { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

const PLACEHOLDER = '/images/placeholder/product-placeholder.png';

export type SafeImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string;
};

export function SafeImage({ src, alt, ...props }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Image
      src={hasError ? PLACEHOLDER : src}
      alt={alt}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
