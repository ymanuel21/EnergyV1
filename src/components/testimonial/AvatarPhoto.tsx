'use client';

import { useState } from 'react';
import { PhotoPlaceholder } from '@ui/PhotoPlaceholder';

interface AvatarPhotoProps {
  /** External or local photo URL. Empty/null means "no photo yet". */
  src?: string | null;
  /** Person's name — used as alt text when a real photo is present. */
  name: string;
  /** Rendered diameter in px. */
  size: number;
  className?: string;
}

/**
 * Testimonial avatar with a single fallback path.
 *
 * Testimonial photos are EXTERNAL urls (Unsplash etc.), so they cannot go through
 * `SafeImage` — next/image would need a `remotePatterns` entry per host. A plain <img>
 * is kept, but two cases now resolve to the approved "Coming Soon" graphic instead of a
 * grey circle or a broken-image icon:
 *   - the testimonial has no photo at all;
 *   - the photo URL exists but fails to load (one live row points at an Unsplash image
 *     that now returns 404, which previously rendered a broken icon).
 *
 * Once `failed` is true it is never reset by the same error, so there is no retry loop.
 */
export function AvatarPhoto({ src, name, size, className = '' }: AvatarPhotoProps) {
  const [failed, setFailed] = useState(false);

  const hasPhoto = Boolean(src && src.trim());
  const showPlaceholder = !hasPhoto || failed;

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-full bg-surface ${className}`}
      style={{ width: size, height: size }}
    >
      {showPlaceholder ? (
        <PhotoPlaceholder fit="cover" sizes={`${size}px`} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- external avatar host, next/image would need remotePatterns
        <img
          src={src as string}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
