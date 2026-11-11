import Image from 'next/image';
import { COMING_SOON_SRC, COMING_SOON_ALT } from '@/lib/image-placeholders';

type Fit = 'cover' | 'contain';

interface PhotoPlaceholderProps {
  /**
   * How the graphic fills its box. Both options preserve aspect ratio — the image is
   * never stretched. `cover` fills card/avatar boxes (crops the generous side margins,
   * the graphic is centred so nothing important is lost); `contain` letterboxes inside
   * fixed-ratio panels.
   */
  fit?: Fit;
  /** Extra classes for the wrapper (rounding, background, etc.). */
  className?: string;
  /** Responsive hint for next/image; defaults to a small card-size string. */
  sizes?: string;
  /** Mark true for an above-the-fold placeholder. */
  priority?: boolean;
}

/**
 * Shared "Coming Soon" photo placeholder.
 *
 * One implementation for every spot where an optional photo is missing, so the artwork,
 * alt text and object-fit behaviour cannot drift between product cards, project covers
 * and testimonial avatars.
 *
 * Renders its own `relative` wrapper (`h-full w-full`) so it can be dropped straight into
 * existing fixed-size containers — including the round avatar boxes — without the caller
 * needing to add positioning.
 */
export function PhotoPlaceholder({
  fit = 'cover',
  className = '',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  priority = false,
}: PhotoPlaceholderProps) {
  return (
    <span className={`relative block h-full w-full overflow-hidden ${className}`}>
      <Image
        src={COMING_SOON_SRC}
        alt={COMING_SOON_ALT}
        fill
        sizes={sizes}
        priority={priority}
        // `object-cover`/`object-contain` keeps the aspect ratio intact either way
        className={fit === 'contain' ? 'object-contain' : 'object-cover'}
      />
    </span>
  );
}
