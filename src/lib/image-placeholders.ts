/**
 * Central registry for local image placeholders + "this is not a real photo" detection.
 *
 * `coming-soon.png` is the client-approved "Coming Soon" camera graphic. It is used
 * whenever an OPTIONAL photo is genuinely absent. The file is a byte-exact copy of the
 * supplied design (`Minimal Coming Soon Camera Placeholder.png`) — never regenerate or
 * recompress it.
 *
 * Keep every placeholder reference pointing here so there is exactly one source of truth.
 */

/** Approved "Coming Soon" camera placeholder (1536x1024, light grey, centred graphic). */
export const COMING_SOON_SRC = '/images/placeholder/coming-soon.png';

/** Alt text matching the text baked into the artwork. */
export const COMING_SOON_ALT = 'Coming Soon';

/**
 * LEGACY SENTINEL — a solid 400x400 grey PNG (single colour #E6E6E6) that the admin
 * product form used to write into `products.images` when a product had no photo.
 *
 * It is a REAL, loadable file, so an image component cannot tell it apart from a genuine
 * photo by loading it. Products carrying this path therefore showed a blank grey square
 * instead of the Coming Soon fallback. Treating the path as "no photo" fixes them without
 * touching stored records (the write path is fixed separately).
 *
 * Three published products carried it (plus one draft in `draftData`). It is deliberately
 * NOT deleted or overwritten — this constant is the only thing that needs to exist for the
 * sentinel to be recognised.
 */
export const LEGACY_PRODUCT_PLACEHOLDER = '/images/placeholder/product-placeholder.png';

/**
 * True when a value is not a real photo: empty/whitespace, the legacy grey sentinel, or
 * the Coming Soon artwork itself. Absolute URLs are reduced to their pathname first, so a
 * sentinel served from another origin is still recognised.
 */
export function isPlaceholderImage(src?: string | null): boolean {
  if (src === undefined || src === null) return true;
  const raw = src.trim();
  if (!raw) return true;

  let path = raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      path = new URL(raw).pathname;
    } catch {
      path = raw;
    }
  }
  path = path.split('?')[0].split('#')[0];

  return path === LEGACY_PRODUCT_PLACEHOLDER || path === COMING_SOON_SRC;
}

/**
 * First entry of a product `images` array that is a genuine photo.
 * Returns `undefined` when every entry is a placeholder (or the array is empty), which is
 * exactly the signal the image components use to fall back to Coming Soon.
 */
export function firstRealImage(
  images?: readonly (string | null | undefined)[] | null,
): string | undefined {
  if (!Array.isArray(images)) return undefined;
  for (const candidate of images) {
    if (typeof candidate === 'string' && !isPlaceholderImage(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

/**
 * `images` with every placeholder entry removed, preserving order.
 * Used where the full list is rendered (PDP gallery) so a sentinel never appears as a
 * thumbnail next to real photos.
 */
export function stripPlaceholderImages(
  images?: readonly (string | null | undefined)[] | null,
): string[] {
  if (!Array.isArray(images)) return [];
  return images.filter(
    (candidate): candidate is string => typeof candidate === 'string' && !isPlaceholderImage(candidate),
  );
}
