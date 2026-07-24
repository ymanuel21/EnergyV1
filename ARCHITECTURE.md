# EnergyV1 — Complete Project Structure & Conventions

> Approved architecture. Begin Phase 1 here.

## Directory Purpose Legend

| Marker | Meaning |
|--------|---------|
| `[S]` | Server Component (renders on server, no 'use client') |
| `[C]` | Client Component ('use client' — interactivity, hooks, event handlers) |
| `[U]` | Shared utility / pure function / library code |
| `[D]` | Domain-specific data or logic |
| `[T]` | Type definition |
| `[A]` | Asset (image, font, static file) |
| `[X]` | Config / build tool / dev dependency |

---

## Complete Tree

```
EnergyV1/
│
├── public/                                    # [A] Static assets served at /
│   ├── images/                                # All images live here (no src/ imports for images)
│   │   ├── logo.svg                           # Energi.Click logo (SVG, currentColor compatible)
│   │   ├── banners/                           # Hero banner images
│   │   │   ├── hero-1.webp                    # 1280×427 — slide 1
│   │   │   └── hero-2.webp                    # 1280×427 — slide 2
│   │   ├── need-cards/                        # "Mulai dari kebutuhan Anda" icons
│   │   │   ├── beli-produk.svg
│   │   │   ├── pasang-plts.svg
│   │   │   └── kebutuhan-proyek.svg
│   │   ├── icons/                             # UI icons (SVG, currentColor)
│   │   │   ├── compare.svg
│   │   │   ├── wishlist.svg
│   │   │   ├── wishlist-filled.svg
│   │   │   ├── cart.svg
│   │   │   ├── account.svg
│   │   │   ├── search.svg
│   │   │   ├── hamburger.svg
│   │   │   ├── whatsapp.svg
│   │   │   ├── star.svg
│   │   │   ├── star-filled.svg
│   │   │   ├── chevron-right.svg
│   │   │   ├── chevron-down.svg
│   │   │   └── x.svg
│   │   ├── brands/                            # Brand logo images
│   │   │   └── ...                            # Named by brand slug: mitsubishi-electric.svg etc.
│   │   └── placeholder/                       # Fallback images
│   │       └── product-placeholder.webp       # 400×400 gray gradient
│   ├── favicon.ico
│   ├── robots.txt                             # Allow all, point to sitemap
│   └── sitemap.xml                            # Generated at build time
│
├── src/
│   │
│   ├── app/                                   # [S] Next.js App Router — pages and layouts
│   │   │
│   │   ├── layout.tsx                         # [S] Root layout: <html>, <body>, providers, TopBar, Header, Footer
│   │   │                                      # Why here: Next.js requires root layout. Wraps EVERY page.
│   │   │
│   │   ├── page.tsx                           # [S] Homepage route (/)
│   │   │                                      # Why here: App Router file convention. Static, data-heavy — stays server.
│   │   │
│   │   ├── not-found.tsx                      # [S] 404 page
│   │   ├── error.tsx                          # [C] Error boundary ('use client' required by Next.js)
│   │   ├── loading.tsx                        # [S] Global loading skeleton
│   │   │
│   │   ├── kategori/                          # Category routes
│   │   │   ├── layout.tsx                     # [S] Shared layout: breadcrumb + sidebar + grid wrapper
│   │   │   └── [slug]/                        # Dynamic category slug
│   │   │       └── page.tsx                   # [S] Category listing page (static generation)
│   │   │
│   │   ├── produk/                            # Product routes
│   │   │   └── [slug]/                        # Dynamic product slug
│   │   │       ├── page.tsx                   # [S] Product detail (mostly static, tabs are [C])
│   │   │       └── loading.tsx                # [S] Product detail skeleton
│   │   │
│   │   ├── keranjang/
│   │   │   └── page.tsx                       # [C] Cart page — reads CartContext
│   │   │
│   │   ├── checkout/
│   │   │   └── page.tsx                       # [C] Checkout — form state, multi-step
│   │   │
│   │   ├── promo/
│   │   │   └── page.tsx                       # [S] Promo product listing
│   │   │
│   │   ├── barang-clearance/
│   │   │   └── page.tsx                       # [S] Clearance product listing
│   │   │
│   │   ├── produk-baru/
│   │   │   └── page.tsx                       # [S] New products listing
│   │   │
│   │   ├── brand/
│   │   │   ├── page.tsx                       # [S] Brand directory grid
│   │   │   └── [slug]/
│   │   │       └── page.tsx                   # [S] Brand product listing
│   │   │
│   │   ├── permintaan-penawaran/
│   │   │   └── page.tsx                       # [C] RFQ form — multi-section form state
│   │   │
│   │   ├── afiliasi/
│   │   │   └── page.tsx                       # [S] Affiliate program info page
│   │   │
│   │   ├── artikel/
│   │   │   └── page.tsx                       # [S] Articles listing
│   │   │
│   │   ├── faq/
│   │   │   └── page.tsx                       # [S] FAQ with accordions
│   │   │
│   │   ├── wishlist/
│   │   │   └── page.tsx                       # [C] Wishlist — reads WishlistContext, dispatches to Cart
│   │   │
│   │   ├── perbandingan/
│   │   │   └── page.tsx                       # [C] Comparison — reads CompareContext
│   │   │
│   │   ├── masuk/
│   │   │   └── page.tsx                       # [C] Login form
│   │   │
│   │   ├── cari/
│   │   │   └── page.tsx                       # [C] Search results — reads URL ?q= param
│   │   │
│   │   └── halaman/
│   │       └── [slug]/
│   │           └── page.tsx                   # [S] Static content pages (About, Shipping, etc.)
│   │
│   ├── components/                            # [S]/[C] Reusable UI components
│   │   │
│   │   ├── layout/                            # Site-wide layout shell
│   │   │   ├── TopBar.tsx                     # [S] Brand tagline bar + utility links
│   │   │   ├── Header.tsx                     # [S] Sticky header shell (wraps Client children)
│   │   │   ├── HeaderIcons.tsx                # [C] Cart/Wishlist/Compare icon buttons with badge counts
│   │   │   ├── CategoryDropdown.tsx           # [C] "Semua Kategori" button + mega-menu overlay
│   │   │   ├── CategoryNav.tsx                # [S] Horizontal scrollable category links
│   │   │   ├── Footer.tsx                     # [S] 4-column footer
│   │   │   ├── FloatingWhatsApp.tsx           # [C] Fixed green button (click to wa.me)
│   │   │   ├── MobileMenu.tsx                 # [C] Slide-out drawer (mobile only, lg:hidden)
│   │   │   └── SkipToContent.tsx              # [S] Accessibility skip link
│   │   │
│   │   ├── home/                              # Homepage-specific sections
│   │   │   ├── HeroSlider.tsx                 # [C] Banner carousel (auto-rotate needs client)
│   │   │   ├── NeedCards.tsx                  # [S] 3-card "Mulai dari kebutuhan Anda" section
│   │   │   └── ProductCarouselSection.tsx     # [S] Reusable: overline + title + description + carousel
│   │   │
│   │   ├── product/                           # Product display components
│   │   │   ├── ProductCard.tsx                # [S] Product card for grids (static display)
│   │   │   ├── ProductCardClient.tsx          # [C] Thin wrapper: adds WishlistButton to ProductCard
│   │   │   ├── ProductGrid.tsx                # [S] Responsive product grid container
│   │   │   ├── ProductCarousel.tsx            # [S] Horizontal scroll container (CSS scroll-snap)
│   │   │   ├── ImageGallery.tsx               # [C] Main image + thumbnails + zoom modal
│   │   │   ├── ImageZoomModal.tsx             # [C] Full-screen image zoom overlay
│   │   │   ├── PriceBlock.tsx                 # [S] Price display: original + sale + discount %
│   │   │   ├── QuantitySelector.tsx           # [C] [-][+][number] stepper (local useState)
│   │   │   ├── ProductTabs.tsx                # [C] Tab container: Deskripsi|Spesifikasi|Dokumen|Pengiriman
│   │   │   ├── ProductBadge.tsx               # [S] Single badge pill (Clearance/Promo/Baru)
│   │   │   ├── WishlistButton.tsx             # [C] Heart toggle icon — reads WishlistContext
│   │   │   ├── CompareButton.tsx              # [C] Compare toggle — reads CompareContext
│   │   │   ├── ShareButton.tsx                # [C] Copy product link to clipboard
│   │   │   ├── AffiliateBanner.tsx            # [S] Commission info banner (static display)
│   │   │   ├── ConditionBadge.tsx             # [S] "Kondisi: X • Garansi: Y" badge
│   │   │   ├── RelatedProducts.tsx            # [S] "Produk Terkait" section wrapper
│   │   │   ├── ReviewSection.tsx              # [S] Ratings display (stars + review list)
│   │   │   ├── QAForm.tsx                     # [C] Product Q&A submission form
│   │   │   └── ProductDetailSkeleton.tsx      # [S] Loading skeleton matching product layout
│   │   │
│   │   ├── category/                          # Category/browsing components
│   │   │   ├── FilterSidebar.tsx              # [C] Full filter panel (mobile: bottom sheet)
│   │   │   ├── PriceRangeFilter.tsx           # [C] Min-Max number inputs
│   │   │   ├── FilterCheckboxGroup.tsx        # [C] Checkbox list with "Tampilkan lebih" expand
│   │   │   ├── RatingFilter.tsx               # [C] Star rating radio buttons
│   │   │   ├── SortDropdown.tsx               # [C] Sort select (updates URL params)
│   │   │   ├── CategoryHeader.tsx             # [S] "{Category Name} — N produk ditemukan"
│   │   │   └── ActiveFilters.tsx              # [C] Removable filter pills (reads URL params)
│   │   │
│   │   ├── cart/                              # Cart page components
│   │   │   ├── CartItem.tsx                   # [C] Single cart line (quantity, remove, price)
│   │   │   ├── CartSummary.tsx                # [C] Subtotal, shipping, total, checkout button
│   │   │   └── CartEmptyState.tsx             # [S] "Keranjang kosong — Mulai Belanja"
│   │   │
│   │   ├── checkout/                          # Checkout components
│   │   │   ├── CheckoutForm.tsx               # [C] Multi-step form container
│   │   │   ├── ShippingForm.tsx               # [C] Address + contact fields
│   │   │   ├── PaymentMethod.tsx              # [C] Payment option selection
│   │   │   └── OrderReview.tsx                # [C] Final review before submit
│   │   │
│   │   ├── forms/                             # Standalone form components
│   │   │   ├── SearchBar.tsx                  # [C] Header search input (navigates to /cari?q=)
│   │   │   ├── NewsletterForm.tsx             # [C] Email input + "Ikuti" button (footer)
│   │   │   ├── RfqForm.tsx                    # [C] Multi-section RFQ (contact, project, items, files)
│   │   │   └── FileUpload.tsx                 # [C] Drag-and-drop + file input
│   │   │
│   │   └── ui/                                # DESIGN SYSTEM — atomic UI primitives
│   │       ├── Button.tsx                     # [S] Base button (variants: primary, outline, ghost, whatsapp)
│   │       ├── Badge.tsx                      # [S] Inline status badge (variants: clearance, promo, new, cheapest)
│   │       ├── Price.tsx                      # [S] Formatted currency display (Rp X.XXX.XXX)
│   │       ├── SectionHeading.tsx             # [S] Overline + title + description block
│   │       ├── Breadcrumb.tsx                 # [S] Breadcrumb nav (schema.org markup)
│   │       ├── Container.tsx                  # [S] max-w-7xl centered wrapper
│   │       ├── Skeleton.tsx                   # [S] Base skeleton (width/height/rounded via className)
│   │       ├── Modal.tsx                      # [C] Portal overlay + backdrop + focus trap
│   │       ├── Tabs.tsx                       # [C] Accessible tablist container
│   │       ├── Accordion.tsx                  # [C] Expandable content section
│   │       ├── Pagination.tsx                 # [C] Page navigation (reads URL params)
│   │       ├── EmptyState.tsx                 # [S] Icon + title + description + optional action
│   │       ├── IconButton.tsx                 # [S] Icon-only button with optional badge counter
│   │       ├── VisuallyHidden.tsx             # [S] Screen-reader-only content
│   │       └── Divider.tsx                    # [S] Horizontal rule with optional label
│   │
│   ├── lib/                                   # [U] Pure functions, data access, constants
│   │   ├── data/                              # [D] Static data store (replace with CMS/API later)
│   │   │   ├── products.ts                    # Product catalog (array of Product objects)
│   │   │   ├── categories.ts                  # Category tree
│   │   │   ├── brands.ts                      # Brand directory
│   │   │   ├── banners.ts                     # Hero slider data
│   │   │   ├── faq.ts                         # FAQ items
│   │   │   └── static-pages.ts               # Static page content (About, Policies, etc.)
│   │   │
│   │   ├── api/                               # [U] Data access layer (abstraction over lib/data/)
│   │   │   ├── products.ts                    # getProductBySlug, getProducts, getRelated, search
│   │   │   ├── categories.ts                  # getCategories, getCategoryBySlug, getCategoryTree
│   │   │   ├── brands.ts                      # getBrands, getBrandBySlug
│   │   │   └── filters.ts                     # applyFilters, sortProducts, getFilterOptions
│   │   │
│   │   ├── utils/                             # [U] Pure utility functions
│   │   │   ├── cn.ts                          # clsx + tailwind-merge wrapper
│   │   │   ├── format.ts                      # formatCurrency(), formatDate(), formatNumber()
│   │   │   ├── slug.ts                        # toSlug(), fromSlug()
│   │   │   └── validation.ts                  # isEmail(), isPhone(), required()
│   │   │
│   │   ├── constants.ts                       # [U] Site-wide constants (phone, address, social links)
│   │   └── metadata.ts                        # [U] generateMetadata() factory for SEO
│   │
│   ├── hooks/                                 # [C] Custom React hooks (client-only)
│   │   ├── useCart.ts                         # Cart context consumer hook
│   │   ├── useWishlist.ts                     # Wishlist context consumer hook
│   │   ├── useCompare.ts                      # Compare context consumer hook
│   │   ├── useLocalStorage.ts                 # Generic localStorage read/write with SSR safety
│   │   ├── useMediaQuery.ts                   # Responsive breakpoint detection
│   │   ├── useDebounce.ts                     # Debounced value (search input)
│   │   └── useScrollPosition.ts              # Current scroll Y (header shadow trigger)
│   │
│   ├── providers/                             # [C] React Context providers
│   │   ├── CartProvider.tsx                   # Cart state + localStorage persistence
│   │   ├── WishlistProvider.tsx               # Wishlist state + localStorage persistence
│   │   └── CompareProvider.tsx                # Compare state + localStorage persistence
│   │
│   └── types/                                 # [T] TypeScript type definitions
│       ├── product.ts                         # Product, Category, Brand, ProductImage, Specification
│       ├── cart.ts                            # CartItem, CartState, CartAction
│       ├── filter.ts                          # ProductFilters, SortOption, FilterOptions
│       ├── forms.ts                           # RfqSubmission, QAQuestion, NewsletterSubscription
│       ├── common.ts                          # PageProps, MetadataParams, Nullable<T>
│       └── index.ts                           # Re-export barrel
│
├── tailwind.config.ts                        # [X] Tailwind configuration
├── tsconfig.json                             # [X] TypeScript configuration
├── next.config.js                            # [X] Next.js configuration (images, redirects)
├── postcss.config.js                         # [X] PostCSS (Tailwind + autoprefixer)
├── package.json                              # [X] Dependencies + scripts
├── .eslintrc.json                            # [X] ESLint rules
├── .prettierrc                               # [X] Prettier formatting
├── .gitignore                                # [X] Git ignore rules
└── README.md                                 # [X] Project documentation
```

---

## Component Count Summary

| Category | Server [S] | Client [C] | Total |
|----------|-----------|-----------|-------|
| `layout/` | 5 | 4 | 9 |
| `home/` | 2 | 1 | 3 |
| `product/` | 11 | 6 | 17 |
| `category/` | 1 | 6 | 7 |
| `cart/` | 1 | 2 | 3 |
| `checkout/` | 0 | 4 | 4 |
| `forms/` | 0 | 4 | 4 |
| `ui/` | 10 | 4 | 14 |
| **Total** | **30** | **31** | **61** |

---

## Talwind Configuration Strategy

### Custom Color Scale

Two custom color families extend Tailwind's default palette:

```
brand:  50..900  (teal — #F0FDFA → #042F2E)
accent: 50..700  (orange — #FFF7ED → #C2410C)
```

Used as: `bg-brand-700`, `text-brand-600`, `border-accent-500`, `hover:bg-brand-50`

No other custom colors. Gray, red, green come from Tailwind defaults.

### Plugins

```typescript
plugins: [
  require('@tailwindcss/forms'),      // Better input/select/checkbox reset
  require('@tailwindcss/typography'),  // prose class for product descriptions
  require('@tailwindcss/aspect-ratio'),// aspect-square etc.
]
```

### Content Paths

```typescript
content: [
  './src/**/*.{ts,tsx}',
]
```

### Custom Animations

```
animate-fade-in     → opacity 0→1, 200ms
animate-slide-up    → translateY 8px→0 + opacity 0→1, 300ms
animate-slide-down  → translateY -8px→0 + opacity 0→1, 200ms
animate-scale-in    → scale 0.95→1 + opacity 0→1, 150ms
animate-pulse-soft  → opacity 1→0.7→1, 2s infinite
```

### Design Token Architecture

```
Design tokens live in tailwind.config.ts ONLY.
No CSS variables. No separate token file.
No theme provider. No runtime theming.

Why: This is a 1:1 recreation of a single-brand site.
The brand never changes. Tokens compile to static CSS at build time.
CSS variables add runtime overhead with zero benefit here.

Exception: One CSS variable for scrollbar-hide utility class
(not a token, a browser compatibility workaround).
```

### Spacing Convention

| Tailwind Class | Value | Usage Pattern |
|---------------|-------|---------------|
| `p-4` / `px-4` | 16px | Default horizontal padding |
| `py-10` | 40px | Section vertical padding |
| `gap-4` | 16px | Product card grids |
| `gap-6` | 24px | Section internal gaps |
| `gap-8` | 32px | Section-to-section spacing |
| `space-y-2` | 8px | List item spacing |

---

## Component Naming Conventions

### File Naming

```
PascalCase for components:    ProductCard.tsx
camelCase for utilities:      cn.ts
kebab-case for config:        tailwind.config.ts
kebab-case for data files:    static-pages.ts
```

### Component Organization

```
1. One component per file (no exceptions)
2. File name = exported component name
3. No index.ts barrel files inside components/ (barrels break tree-shaking)
4. Co-locate variants: ProductCard.tsx + ProductCardClient.tsx (not ProductCard/index.tsx)
```

### Export Convention

```typescript
// Named export for the component
export function ProductCard({ product }: ProductCardProps) { ... }

// Default export ONLY for pages (Next.js App Router convention)
// All components use named exports
```

### Prop Interface Naming

```typescript
interface ProductCardProps { ... }     // ComponentName + "Props"
interface ProductFilters { ... }       // Domain types: no suffix
type SortOption = 'price-asc' | ...   // Union types: no suffix
```

### 'use client' Placement

```typescript
// ALWAYS line 1 (before imports)
'use client';

import { useState } from 'react';
```

---

## Import Alias Strategy

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@ui/*": ["./src/components/ui/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@providers/*": ["./src/providers/*"],
      "@types/*": ["./src/types/*"],
      "@public/*": ["./public/*"]
    }
  }
}
```

### Import Convention

```typescript
// ✅ DO: use aliases for everything
import { ProductCard } from '@components/product/ProductCard';
import { formatCurrency } from '@lib/utils/format';
import { Button } from '@ui/Button';
import type { Product } from '@types/product';

// ❌ DON'T: relative imports across directories
import { ProductCard } from '../../../components/product/ProductCard';

// ✅ OK: relative imports within same directory
import { Price } from './Price';

// ✅ OK: relative imports from parent
import { useCart } from '../hooks/useCart';
```

### Import Order (enforced by Prettier plugin)

```
1. React / Next.js
2. External libraries
3. Internal aliases (@components, @lib, etc.)
4. Relative imports
5. Type imports (separate import type { } block)
```

---

## Environment Variable Strategy

### Variables

```bash
# .env.local (not committed)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=6281234567890

# Build-time only
NEXT_PUBLIC_SITE_NAME=Energi.Click
NEXT_PUBLIC_SITE_DESCRIPTION=Energi Cerdas, Tinggal Klik!
```

### Rules

```
- NEXT_PUBLIC_ prefix → available client-side (embedded at build)
- No secrets in this project (no API keys, no database URLs)
- All variables have fallbacks in code via: process.env.NEXT_PUBLIC_X ?? 'default'
- .env.local in .gitignore
- .env.example committed with placeholder values
```

### Why No Dynamic Config

The site is fully static. All product data, content, and configuration are code (TypeScript files in `lib/data/`). No runtime configuration needed. Environment variables only handle deployment-specific values (site URL, WhatsApp number) that differ between local and production.

---

## Static Asset Strategy

### Images

```
public/images/        → served at /images/...
                       → <Image src="/images/products/foo.webp" ... />
```

### Why public/ Not src/

```
✅ public/: Zero-config. Direct URL access. No build processing overhead.
           Images are referenced by path strings, not imports.

❌ src/ imports: Requires webpack/Vite processing. Every image adds to bundle
                 analysis. Overkill for an e-commerce site with 50+ product images.
```

### Image Format

```
- WebP for all product/banner images (smaller, supported everywhere)
- SVG for icons and logo (scalable, currentColor compatible)
- No PNG except favicon
```

### Next.js Image Component

```typescript
// Product cards: responsive, lazy-loaded
<Image src={src} alt={alt} width={400} height={400} className="aspect-square object-cover" />

// Hero banners: priority loading
<Image src={src} alt={alt} width={1280} height={427} priority />

// Icons: inline SVG, no next/image needed
<CompareIcon className="h-5 w-5" />
```

---

## SEO Metadata Strategy

### Factory Pattern

```typescript
// lib/metadata.ts
export function generatePageMetadata(params: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'product';
  noIndex?: boolean;
}): Metadata;
```

### Per-Page Usage

```typescript
// app/produk/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return generatePageMetadata({ title: '404', ... });

  return generatePageMetadata({
    title: product.name,
    description: `${product.brand.name} ${product.name} — Rp ${formatCurrency(product.price)}`,
    path: `/produk/${product.slug}`,
    image: product.images[0]?.src,
    type: 'product',
  });
}
```

### What Every Page Gets

```typescript
{
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
  title: { default: 'Energi.Click — Energi Cerdas, Tinggal Klik!', template: '%s — Energi.Click' },
  description: 'Pusat produk energi terbarukan...',
  openGraph: { type, title, description, images, url },
  twitter: { card: 'summary_large_image', ... },
  robots: noIndex ? 'noindex' : 'index, follow',
  alternates: { canonical: path },
}
```

### Structured Data

Generated per page in the component body (not metadata API):

```typescript
// Product detail page
<script type="application/ld+json">
  {JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    offers: { price: product.price, priceCurrency: 'IDR', availability: 'InStock' },
    brand: { '@type': 'Brand', name: product.brand.name },
  })}
</script>
```

---

## Summary: What Needs Approval

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | 61 components (30 S / 31 C) | More S than C because e-commerce display is mostly read-only |
| 2 | No index.ts barrels in components/ | Barrels break Next.js tree-shaking for Client Components |
| 3 | Design tokens in tailwind.config.ts only | Single-brand site — no runtime theming overhead |
| 4 | Images in public/ not src/ imports | 50+ product images, no build processing needed |
| 5 | 2 custom color families (brand + accent) | Everything else from Tailwind defaults |
| 6 | 6 path aliases | Clean imports, no `../../../` spaghetti |
| 7 | No dynamic env config | Fully static site, env only for deployment values |
| 8 | SEO factory + per-page generateMetadata | Consistent metadata, DRY |
| 9 | Named exports for all components | Consistent module pattern |
