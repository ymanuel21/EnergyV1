# Image Strategy — Detailed Analysis

## public/ vs src/ Imports

### Current Decision: `public/` directory

```
public/images/products/mitsubishi-275wp.webp  →  /images/products/mitsubishi-275wp.webp
public/images/banners/hero-1.webp             →  /images/banners/hero-1.webp
```

### Why NOT `src/` imports

```typescript
// ❌ src/ import approach:
import productImage from '@/assets/products/mitsubishi-275wp.webp';
// Problem: Webpack processes EVERY image at build time.
// With 50+ product images × 4 sizes each = 200+ generated images.
// Every image adds to the Webpack module graph.
// Build time scales linearly with image count.
// Import paths must be known at compile time — no dynamic product catalogs.
```

```typescript
// ✅ public/ approach:
<Image src={`/images/products/${product.images[0]}.webp`} ... />
// Image path is a string — any value works, including from a database.
// Zero build-time processing. Next.js Image component handles optimization at request time.
// No module graph pollution. Build stays fast regardless of catalog size.
```

### When src/ imports make sense

| Scenario | Use src/ import? |
|----------|-----------------|
| Logo (single instance, always loaded) | ✅ Yes — import for hash-based cache busting |
| Icons (SVG, tiny, used everywhere) | ✅ Yes — inline SVGs, no optimization needed |
| Product images (50+, dynamic paths) | ❌ No — public/ with Next.js Image |
| Banners (2-3, known at build time) | ⚠️ Either — public/ is fine, src/ gives hash filenames |

**Decision: public/ for product images and banners. SVG icons as inline components.**

### Hash-Based Cache Busting for public/

The downside of `public/` is no automatic content-hash in filenames. Mitigation:

```typescript
// next.config.js — add version query param to image URLs
images: {
  // Next.js Image adds ?w=400&q=75 automatically
  // For cache busting on deploy, add a version param:
  // Not needed — Next.js Image's built-in optimization URLs already include width/quality
  // which change on config updates, effectively busting cache
}
```

---

## Image Optimization Plan

### Pipeline

```
Source Image (WebP, 1254×1254)
    ↓
Stored in public/images/products/
    ↓
Next.js <Image> component requests it
    ↓
Next.js Image Optimization API (built-in)
    ↓
Resizes + compresses + converts to optimal format
    ↓
Caches result (filesystem in production, memory in dev)
    ↓
Serves to browser
```

### What Next.js Image Does Automatically

- **Resize**: Generates exact dimensions requested via `width`/`height` props
- **Compress**: Applies quality reduction (default 75, configurable)
- **Format**: Auto-detects browser support — serves WebP if supported, falls back to original
- **Lazy load**: `loading="lazy"` by default (except `priority` images)
- **Blur placeholder**: `placeholder="blur"` with base64 `blurDataURL`
- **Cumulative Layout Shift prevention**: Explicit `width`/`height` reserves space

### Configuration

```typescript
// next.config.js
images: {
  formats: ['image/webp'],          // Serve WebP when browser supports it
  deviceSizes: [640, 768, 1024, 1280, 1536],  // Responsive breakpoints for srcSet
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],  // Sizes for fixed-width images
  minimumCacheTTL: 60 * 60 * 24 * 30,  // Cache optimized images for 30 days
}
```

### Product Image Sizing Strategy

| Context | Display Size | Requested Width | File Size (est.) |
|---------|-------------|-----------------|------------------|
| Product card (mobile) | ~175px | 256w | ~8 KB |
| Product card (desktop) | ~280px | 384w | ~15 KB |
| Product detail (main) | ~560px | 768w | ~40 KB |
| Zoom modal (full) | ~1200px | 1280w | ~80 KB |
| Thumbnail | ~80px | 128w | ~3 KB |

```typescript
// Product card — responsive sizes
<Image
  src={src}
  alt={alt}
  width={400}       // aspect ratio reservation
  height={400}
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  className="aspect-square object-cover"
/>

// Product gallery main image
<Image
  src={src}
  alt={alt}
  width={800}
  height={800}
  sizes="(max-width: 1024px) 100vw, 50vw"
  priority  // above the fold
/>

// Product gallery thumbnail
<Image
  src={src}
  alt={alt}
  width={80}
  height={80}
  sizes="80px"
  className="rounded-lg"
/>
```

---

## Responsive Image Strategy

### Breakpoint → Image Width Mapping

```
┌────────────┬───────────────┬────────────────────────────────┐
│ Breakpoint │ Card Size     │ Image Width Needed             │
├────────────┼───────────────┼────────────────────────────────┤
│ Mobile     │ 50vw (2 cols) │ 256w  (50% of 375-414px view) │
│ sm (640)   │ 33vw (3 cols) │ 256w  (33% of 640px = 211px) │
│ md (768)   │ 33vw (3 cols) │ 384w  (33% of 768px = 253px) │
│ lg (1024)  │ 25vw (4 cols) │ 384w  (25% of 1024px = 256px)│
│ xl (1280)  │ 25vw (4 cols) │ 384w  (25% of 1280px = 320px)│
└────────────┴───────────────┴────────────────────────────────┘
```

### sizes Attribute Strategy

```typescript
// Pattern: describe viewport → image display width
export const PRODUCT_CARD_SIZES =
  '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';

export const PRODUCT_GALLERY_SIZES =
  '(max-width: 1024px) 100vw, 50vw';

export const BANNER_SIZES =
  '100vw';

export const THUMBNAIL_SIZES =
  '80px';
```

### Art Direction (not needed here)

Art direction means different crops at different breakpoints. Not applicable:
- Product images are always square (`aspect-square`)
- Banners are always full-width
- No situation where mobile needs a different crop than desktop

---

## LCP (Largest Contentful Paint) Considerations

### What is LCP on this site?

| Page | LCP Element | Strategy |
|------|------------|----------|
| Homepage | Hero banner image | `priority`, `fetchPriority="high"`, preload |
| Category | First product card image | `priority` on first 4 cards |
| Product Detail | Main gallery image | `priority`, preload, no lazy siblings |
| Static pages | Text heading | No image LCP concern |

### Hero Banner — Critical Path

```typescript
// The hero banner is the LCP element on the homepage.
// It must load FIRST — before any other image.

<Image
  src="/images/banners/hero-1.webp"
  alt="..."
  width={1280}
  height={427}
  priority                 // ✅ Preloads via <link rel="preload">
  fetchPriority="high"     // ✅ Browser fetches before other images
  sizes="100vw"
  className="w-full h-auto"
/>

// Also add to layout.tsx <head> for earliest possible discovery:
// This is automatic with Next.js priority — no manual preload needed.
```

### Product Gallery — LCP

```typescript
// Main product image is LCP on product detail page
<Image
  src={product.images[0].src}
  alt={product.name}
  width={800}
  height={800}
  priority                 // ✅ Preload
  fetchPriority="high"
  sizes="(max-width: 1024px) 100vw, 50vw"
/>

// Thumbnails: explicitly NOT priority
<Image
  src={thumb.src}
  alt=""
  width={80}
  height={80}
  loading="lazy"           // Explicit lazy (not default since not in viewport)
  sizes="80px"
/>
```

### Above-the-Fold Product Cards

On category/search pages, the first row of cards is above the fold:

```typescript
// In ProductGrid — first 4 cards get priority
{products.map((product, i) => (
  <ProductCard
    key={product.id}
    product={product}
    priority={i < 4}       // First row = above the fold
  />
))}
```

### Loading Strategy Summary

```
┌──────────────────────┬──────────────┬─────────────┬─────────────────┐
│ Image Type           │ Priority     │ Lazy        │ fetchPriority   │
├──────────────────────┼──────────────┼─────────────┼─────────────────┤
│ Hero banner          │ ✅ priority  │ ❌          │ high            │
│ Product gallery main │ ✅ priority  │ ❌          │ high            │
│ First row cards      │ ✅ priority  │ ❌          │ auto (default)  │
│ Below-fold cards     │ ❌           │ ✅ default  │ auto            │
│ Thumbnails           │ ❌           │ ✅ explicit │ low             │
│ Footer logos         │ ❌           │ ✅ default  │ low             │
│ Need card icons      │ ❌           │ ✅ default  │ auto            │
└──────────────────────┴──────────────┴─────────────┴─────────────────┘
```

---

## Implementation Checklist

- [ ] `next.config.js` — image formats, deviceSizes, imageSizes, minimumCacheTTL
- [ ] `ProductCard` — `sizes` prop, conditional `priority`, `aspect-square`
- [ ] `HeroSlider` — `priority` + `fetchPriority="high"` on active slide
- [ ] `ImageGallery` — `priority` on main image, `loading="lazy"` on thumbnails
- [ ] Banner images stored as WebP at 1280×427 (original resolution from energi.click)
- [ ] Product images stored as WebP (original from energi.click storage)
- [ ] No image processing at build time (all handled by Next.js Image Optimization at request time)
