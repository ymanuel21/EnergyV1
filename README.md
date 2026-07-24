# EBTPlaza — Energi Terbarukan, Harga Terjangkau!

E-commerce platform for renewable energy products: solar panels, inverters, batteries, PLTS packages, and project procurement. Built with Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4, and Playwright E2E testing.

---

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org) | 16.2.11 | App Router, SSR, ISR, metadata, sitemap |
| [React](https://react.dev) | 19.2.4 | UI components, hooks |
| [TypeScript](https://typescriptlang.org) | 5.x | Strict type checking |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first CSS, CSS-based config |
| [Playwright](https://playwright.dev) | 1.61.1 | E2E testing (28 tests, 0 failures) |
| [class-variance-authority](https://cva.style) | 0.7.1 | Type-safe component variants |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | Conditional classnames |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 3.2.0 | Conflict-free class merging |

**Zero runtime state management libraries.** Cart, Wishlist, and Compare use plain React Context + useReducer (294 lines combined).

---

## Quick Start

```bash
git clone https://github.com/ymanuel21/EnergyV1.git
cd EnergyV1
cp .env.example .env.local    # configure env vars
npm install
npm run dev                    # http://localhost:3000
```

**Commands:**
| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server with Turbopack |
| `npm run build` | Production build (TypeScript + static generation) |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npx playwright test` | Run E2E tests |

---

## Architecture

```
src/
├── app/                    # Next.js App Router — 19 routes
│   ├── layout.tsx          # Root layout: providers, metadata, fonts
│   ├── page.tsx            # Homepage
│   ├── not-found.tsx       # Custom 404
│   ├── robots.ts           # robots.txt generation
│   ├── sitemap.ts          # sitemap.xml generation
│   ├── produk/             # Product listing + [slug] detail
│   ├── kategori/[slug]/    # Category listing with sort/pagination
│   ├── cari/               # Search results
│   ├── brand/              # Brand directory + [slug] products
│   ├── promo/              # Promo listing
│   ├── barang-clearance/   # Clearance listing
│   ├── artikel/            # Article listing + [slug] detail
│   ├── faq/                # FAQ with accordion
│   ├── afiliasi/           # Affiliate info page
│   ├── permintaan-penawaran/ # RFQ form
│   ├── halaman/[slug]/     # Static pages (About, Shipping, etc.)
│   ├── keranjang/          # Cart
│   ├── wishlist/           # Wishlist
│   ├── perbandingan/       # Product comparison
│   └── checkout/           # Checkout → Sheets + WhatsApp
│
├── components/
│   ├── ui/                 # 18 reusable primitives: Button, Badge, Modal, etc.
│   ├── layout/             # 8 layout components: Header, Footer, TopBar, etc.
│   ├── product/            # 9 product components: ProductCard, ImageGallery, etc.
│   ├── home/               # 3 homepage sections: HeroSlider, NeedCards, etc.
│   ├── category/           # 1 category component: SortDropdown
│   └── forms/              # 2 form components: SearchBar, NewsletterForm
│
├── lib/
│   ├── api/                # Data access layer
│   │   ├── products.ts     # Product queries (single source of truth)
│   │   ├── brands.ts       # Brand lookups (pre-indexed Map, O(1))
│   │   ├── filters.ts      # Filter/sort/paginate/search pipeline
│   │   └── sheets.ts       # Google Sheets + WhatsApp order integration
│   ├── data/               # Static data (8 products, 9 categories, etc.)
│   ├── utils/              # cn(), formatCurrency(), validateSort(), etc.
│   └── constants.ts        # SITE config, navigation, social
│
├── providers/              # React Context providers (no external libs)
│   ├── CartProvider.tsx    # Cart: add/remove/quantity/clear + localStorage
│   ├── WishlistProvider.tsx  # Wishlist: toggle + localStorage
│   ├── CompareProvider.tsx   # Compare: toggle (max 4) + localStorage
│   └── ToastProvider.tsx     # Toast notifications
│
├── hooks/
│   └── useLocalStorage.ts  # Generic localStorage hook
│
├── types/
│   ├── product.ts          # Product, Category, Brand, Banner, NeedCard
│   ├── cart.ts             # CartItem, CartState, CartAction
│   ├── filter.ts           # ProductFilters
│   ├── forms.ts            # RfqContact, RfqProject
│   ├── common.ts           # PageProps, MetadataParams
│   └── index.ts            # Barrel export
│
└── app/globals.css         # Tailwind v4 CSS config with brand tokens
```

### Why This Architecture

- **Server Components by default** — 40 of 62 components are Server Components. Only interactive components use `'use client'`.
- **API layer abstracts data** — Components never import from `lib/data/` directly. When products move to a CMS or database, only `lib/api/products.ts` changes.
- **Shared filter pipeline** — Category, Search, Promo, Clearance, and All Products pages share the same `filterByX → sortProducts → paginate` pipeline via `lib/api/filters.ts`.
- **No barrel files in components** — Each component is imported directly (`@ui/Button`, not `@ui`). This enables tree-shaking.
- **Zero external state libraries** — Cart (134 lines), Wishlist (89 lines), Compare (92 lines). Plain Context + useReducer is sufficient for this scale.

---

## Data Flow

```
User Action (click, search, navigate)
    │
    ▼
Route (Server Component)
    │
    ▼
lib/api/products.ts  ← Single source of truth for product data
    │
    ├── getAllProducts()
    ├── getProductBySlug()
    └── getProductsByCategory()
    │
    ▼
lib/api/filters.ts   ← Shared pipeline
    ├── filterByCategory()
    ├── filterByBrand()
    ├── filterByBadge()
    ├── searchProducts()
    ├── sortProducts()
    └── paginate()
    │
    ▼
Components (Server)
    │
    ├── ProductCard, ProductCarouselSection, etc.
    │
    ▼
Client Components (interactive only)
    │
    ├── AddToCartButton, WishlistToggleButton, CompareToggleButton
    │
    ▼
Providers (Context + useReducer)
    │
    ├── CartProvider  ──► localStorage('energyv1-cart')
    ├── WishlistProvider ─► localStorage('energyv1-wishlist')
    ├── CompareProvider  ─► localStorage('energyv1-compare')
    └── ToastProvider
    │
    ▼
UI Update
```

**Key principle**: Data flows from Server → Client, never the reverse. Server Components fetch and filter data. Client Components handle interaction and state.

---

## Routing — Complete Route Map

| # | Route | Render | Purpose | SEO | ISR |
|---|-------|--------|---------|-----|-----|
| 1 | `/` | Static | Homepage — hero, need cards, clearance/promo | index, canonical, OrganizationSchema | — |
| 2 | `/produk` | Dynamic | All products listing — sort, pagination | index, canonical | — |
| 3 | `/produk/[slug]` | SSG | Product detail — gallery, specs, tabs, add-to-cart | index, Product JSON-LD, BreadcrumbList | 1h |
| 4 | `/kategori/[slug]` | Dynamic | Category listing — filter, sort, paginate | index, canonical, BreadcrumbList | 1h |
| 5 | `/cari` | Dynamic | Search results — relevance scoring | noindex, canonical | — |
| 6 | `/brand` | Static | Brand directory grid | index, canonical | — |
| 7 | `/brand/[slug]` | SSG | Products by brand | index, canonical | 1h |
| 8 | `/promo` | Dynamic | Promo product listing | index, canonical | — |
| 9 | `/barang-clearance` | Dynamic | Clearance listing | index, canonical | — |
| 10 | `/artikel` | Static | Article listing | index, canonical | — |
| 11 | `/artikel/[slug]` | SSG | Article detail — related articles | index, ArticleSchema | 1h |
| 12 | `/faq` | Static | FAQ accordions + contact CTA | index, FAQPageSchema | — |
| 13 | `/afiliasi` | Static | Affiliate program info | index | — |
| 14 | `/permintaan-penawaran` | Static | Multi-product RFQ form | index | — |
| 15 | `/halaman/[slug]` | SSG | Static pages (About, Shipping, Returns, Terms, Privacy) | index, canonical | 1h |
| 16 | `/wishlist` | Static | Wishlist — toggle, add-to-cart | index, canonical | — |
| 17 | `/perbandingan` | Static | Product comparison (max 4) | index, canonical | — |
| 18 | `/keranjang` | Static | Cart — quantity, subtotal, checkout link | — | — |
| 19 | `/checkout` | Static | Checkout — 3 steps → Sheets + WhatsApp | noindex | — |

---

## Component Documentation

### UI Primitives (`src/components/ui/`)

All UI primitives are **Server Components** unless marked.

| Component | Client? | Props | Where Used |
|-----------|---------|-------|------------|
| `Button` | No | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon` + HTML button attrs | Every page |
| `Badge` | No | `variant` (clearance/promo/new/cheapest), `children` | ProductCard, ProductBadge |
| `Price` | No | `amount`, `originalAmount`, `size` | ProductCard, PriceBlock |
| `Container` | No | `size` (default/narrow/wide), `children` | Every page |
| `SectionHeading` | No | `overline`, `title`, `description`, `align` | Homepage sections |
| `Breadcrumb` | No | `items: {label, href}[]` | All content pages |
| `Skeleton` | No | `className` | Loading states |
| `EmptyState` | No | `icon`, `title`, `description`, `action` | Cart, Wishlist, Compare |
| `Icons` | No | `className` | Shared SVG icons — 10 icons |
| `Divider` | No | `label`, `orientation` | Layout |
| `VisuallyHidden` | No | `as` (span/div), `children` | Accessibility |
| `SafeImage` | **Yes** | All `next/image` props + `onError` fallback | All image rendering |
| `Pagination` | **Yes** | `current`, `total`, `baseUrl`, `params`, `siblingCount` | All listing pages |
| `Modal` | **Yes** | `open`, `onClose`, `title`, `size`, `children` | ImageGallery zoom |
| `Tabs` | **Yes** | `tabs: {id, label, content}[]` | Product detail |
| `Accordion` | **Yes** | `title`, `defaultOpen`, `children` | FAQ |
| `IconButton` | No | `label`, `badge`, `children` + HTML button attrs | Header icons |
| `StructuredData` | No | Export: OrganizationSchema, BreadcrumbListSchema, ItemListSchema, FAQPageSchema, ArticleSchema | SEO JSON-LD |

### Layout Components

| Component | Client? | Purpose |
|-----------|---------|---------|
| `TopBar` | No | Utility nav — "Semua Produk", "Promo", etc. |
| `Header` | No | Logo, search, cart/wishlist/compare icons, hamburger |
| `CartHeaderButton` | **Yes** | Cart icon with live `itemCount` badge |
| `CategoryNav` | No | Horizontal category navigation bar |
| `Footer` | No | Branding, nav columns, newsletter, legal links |
| `FloatingWhatsApp` | **Yes** | Fixed WhatsApp button (bottom-right) |
| `SkipToContent` | No | Accessibility skip link |
| `MobileMenu` | **Yes** | Slide-out mobile menu with search |

---

## Context Providers

All providers use **Context + useReducer + localStorage**. No external state libraries.

### CartProvider

| Field | Value |
|-------|-------|
| Storage key | `energyv1-cart` |
| Line count | 134 lines |
| Actions | `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART` |
| Computed | `itemCount`, `subtotal`, `totalWeight` |
| Persistence | `useEffect` writes to localStorage on every state change |

**Important**: No `maxQuantity` cap. Quantity is unlimited. This was an intentional design decision — the stock field is informational only.

### WishlistProvider

| Field | Value |
|-------|-------|
| Storage key | `energyv1-wishlist` |
| Line count | 89 lines |
| Actions | `TOGGLE_ITEM`, `CLEAR_ALL` |
| Methods | `isInWishlist(id)`, `toggleItem(id)`, `clearAll()` |

### CompareProvider

| Field | Value |
|-------|-------|
| Storage key | `energyv1-compare` |
| Line count | 92 lines |
| Max items | 4 (enforced client-side) |
| Actions | `TOGGLE`, `REMOVE`, `CLEAR` |

### ToastProvider

| Field | Value |
|-------|-------|
| Line count | 72 lines |
| Duration | 3 seconds auto-dismiss |
| Methods | `showToast(message, type)` where type is `'success' | 'error'` |

---

## API Layer

### `lib/api/products.ts`

The single source of truth for product data. When products move to a CMS or database, **only this file changes**.

| Function | Returns | Used By |
|----------|---------|---------|
| `getAllProducts()` | `Product[]` | All product listing pages, compare, wishlist |
| `getProductBySlug(slug)` | `Product \| undefined` | Product detail page |
| `getProductsByCategory(categoryId)` | `Product[]` | Category page (via filter pipeline) |

### `lib/api/brands.ts`

Pre-indexed brand map for O(1) lookups instead of O(n) array scanning.

| Function | Returns |
|----------|---------|
| `getBrandById(id)` | `Brand \| undefined` |
| `getBrandBySlug(slug)` | `Brand \| undefined` |
| `getAllBrands()` | `Brand[]` |

### `lib/api/filters.ts`

Shared pipeline used by 5 listing pages (category, search, promo, clearance, all products).

| Function | Purpose |
|----------|---------|
| `filterByCategory(products, categoryId, isSubcategory?)` | Filter products by category |
| `filterByBrand(products, brandId)` | Filter by brand |
| `filterByBadge(products, badge)` | Filter by badge (clearance, promo, new) |
| `searchProducts(products, query)` | Full-text search with relevance scoring |
| `sortProducts(products, sort)` | Sort by price, relevance, newest, discount |
| `paginate(products, page, pageSize)` | Slice + metadata: `{ items, totalPages, totalItems }` |

### `lib/api/sheets.ts`

Checkout → Google Sheets + WhatsApp integration.

| Function | Purpose |
|----------|---------|
| `createOrderPayload(...)` | Builds order object with generated Order ID |
| `saveOrderToSheets(order)` | POSTs to Google Apps Script Web App (fire-and-forget) |
| `buildWhatsAppMessage(waNumber, order)` | Generates `wa.me` URL with pre-filled order message |

---

## SEO

### Infrastructure

| Feature | Implementation |
|---------|---------------|
| `metadataBase` | Set in root layout — resolves all relative URLs to absolute |
| `sitemap.xml` | Auto-generated via `app/sitemap.ts` — 54+ URLs with priority/changefreq |
| `robots.txt` | Auto-generated via `app/robots.ts` — blocks checkout/cart/wishlist/compare/search |
| Canonical URLs | Every page sets `alternates: { canonical: '...' }` |
| Open Graph | Product pages have OG images; category/article pages use text-only OG |
| Twitter Cards | `summary_large_image` set in root layout |
| ISR | `revalidate = 3600` on produk, artikel, brand, halaman SSG routes |

### Structured Data (JSON-LD)

| Schema | Page | Status |
|--------|------|--------|
| `Organization` | Homepage | ✅ `OrganizationSchema` |
| `Product` | `/produk/[slug]` | ✅ Inline JSON-LD |
| `BreadcrumbList` | Category + Product | ✅ `BreadcrumbListSchema` |
| `FAQPage` | `/faq` | ✅ `FAQPageSchema` |
| `Article` | `/artikel/[slug]` | ✅ `ArticleSchema` |
| `ItemList` | Category pages | Component built, not yet embedded |

### Index/Noindex Policy

| Policy | Pages |
|--------|-------|
| `index, follow` | All content pages (homepage, products, categories, brands, articles, FAQ, static pages) |
| `noindex, follow` | Search results, checkout |

---

## Testing

### Structure

```
tests/e2e/
├── smoke/                    # Basic rendering (8 tests)
│   ├── homepage.spec.ts      # Hero, need cards, clearance, promo, header, footer
│   └── product-detail.spec.ts # Title, price, tabs, quantity, add-to-cart
├── critical-path/            # Core business flows (24 tests)
│   ├── category-filtering.spec.ts
│   ├── search.spec.ts
│   ├── brand.spec.ts
│   ├── cart.spec.ts
│   ├── checkout.spec.ts
│   ├── rfq.spec.ts
│   └── wishlist.spec.ts
└── regression/               # Secondary features (9 tests)
    ├── article.spec.ts
    ├── compare.spec.ts
    └── faq.spec.ts
```

**Total**: 32 tests across 11 spec files. **0 false positives** (every test verified against business outcomes).

### Running Tests

```bash
npx playwright test                # all tests (parallel)
npx playwright test --ui           # interactive UI mode
npx playwright test tests/e2e/smoke/  # specific directory
```

### Testing Philosophy

- Every test verifies a **business outcome**, not just element visibility
- Tests assert actual data values (prices, quantities, product names)
- Persistence tests verify localStorage survives page refresh
- URL-driven features (sort, pagination) verify both URL and rendered content
- No mobile viewport tests yet (identified gap)

---

## Maintenance Guide

### Adding a Product

1. Open `src/lib/data/products.ts`
2. Add a new entry to the `products` array following the existing schema
3. Add product images to `public/images/products/`
4. Update `images` array with real paths
5. Update `src/lib/data/categories.ts` if the product belongs to a new category
6. Run `npm run build` — SSG will auto-generate the new product page

### Adding a Category

1. Open `src/lib/data/categories.ts`
2. Add entry with `id`, `slug`, `name`, `productCount`, optional `children`
3. The category page `/kategori/[slug]` auto-generates via `generateStaticParams()`

### Adding an Article

1. Open `src/lib/data/articles.ts`
2. Add entry following the `Article` interface: `slug`, `title`, `excerpt`, `content`, `category`, `author`, `date`, `readTime`
3. SSG auto-generates the article page

### Adding a Brand

1. Open `src/lib/data/brands.ts`
2. Add entry: `id`, `slug`, `name`, `productCount`
3. Assign products to the brand via `brandId` in `products.ts`
4. SSG auto-generates the brand page

### Creating a New Page

1. Create `src/app/your-route/page.tsx`
2. Export `metadata` for SEO
3. If using dynamic params, export `generateStaticParams()`
4. If content updates frequently, add `export const revalidate = 3600`
5. Use existing API layer (`getAllProducts()`, etc.) for data
6. Add canonical URL: `alternates: { canonical: '/your-route' }`

### Creating a New Provider

1. Create `src/providers/YourProvider.tsx`
2. Use `createContext` + `useReducer` pattern (copy CartProvider as template)
3. Add `useEffect` for localStorage persistence
4. Wrap in root layout (`src/app/layout.tsx`) inside `<ToastProvider>`

---

## Deployment

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://energi.click` | metadataBase, sitemap, robots |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes | `6281234567890` | Checkout WhatsApp redirect |
| `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` | No | `''` | Order storage (disabled if empty) |

### Vercel Deploy (Recommended)

1. Import `ymanuel21/EnergyV1` in Vercel dashboard
2. Framework: Next.js (auto-detected)
3. Set environment variables
4. Deploy

The site is currently live at: **https://energyv1.vercel.app**

### Production Checklist

- [ ] All product images replaced with real photos
- [ ] Prices and stock verified against inventory
- [ ] WhatsApp number confirmed active
- [ ] Legal pages (Terms, Privacy, Returns) reviewed
- [ ] Google Search Console property created
- [ ] Sitemap submitted to Google
- [ ] GA4 analytics integrated
- [ ] CSP header configured

---

## Troubleshooting

### Hydration Errors

**Symptom**: `Hydration failed because the server rendered HTML didn't match the client.`

**Cause**: Client Components that read from localStorage render differently on server (empty) vs client (has data). Most common on CartPage, WishlistPage, ComparePage.

**Fix**: These are **expected and harmless** in dev mode. The ComparePage has a `hydrated` state guard. For production, consider `dynamic(() => import(...), { ssr: false })`.

### Images Not Rendering

**Symptom**: Blank spaces where images should be.

**Fix**:
1. Verify the image exists in `public/`
2. Check file extension matches the code reference (`.png` vs `.webp`)
3. `SafeImage` automatically falls back to placeholder on error

### Provider Errors

**Symptom**: `useCart must be used within CartProvider`

**Fix**: The component is rendered outside `<CartProvider>`. Check root layout — providers must wrap all pages. If adding a new page, ensure it's inside the provider tree.

### Build Failures

**Symptom**: TypeScript errors during `npm run build`

**Common causes**:
- Importing from `@/lib/data/` instead of `@/lib/api/`
- Passing functions as props to Client Components
- Missing `'use client'` directive on interactive components

### Playwright Failures

**Symptom**: Tests pass locally but fail in CI

**Fix**:
- Ensure dev server is running on port 3000
- Check `baseURL` in playwright.config.ts
- Run with `--workers=1` to isolate state-dependent failures

---

## Future Improvements

### Technical Debt

| Item | Priority | Effort |
|------|----------|--------|
| Split 369-line RFQ page into components | P1 | 45 min |
| Add mobile viewport Playwright tests | P1 | 1 hour |
| Add loading.tsx to dynamic routes | P2 | 20 min/route |
| CSP header in next.config.ts | P1 | 15 min |
| ItemListSchema on category pages | P2 | 10 min |
| Replace placeholder product images | Content | days |

### Authentication (Not Implemented)

This project is **guest-first by design**. No authentication exists because no feature requires user identity.

If auth is needed later (for affiliate dashboard or order history):
1. Add NextAuth.js or Clerk
2. Wrap protected routes in middleware
3. Add `userId` to Cart/Wishlist providers for server-side persistence
4. The current guest experience must remain intact

### CMS Migration Path

Current data lives in `src/lib/data/*.ts` files. To migrate to a CMS:

1. **Only change** `src/lib/api/products.ts` — it's the single abstraction point
2. Replace `import { products } from '@/lib/data/products'` with `fetch('/api/products')` or CMS SDK calls
3. All components call `getAllProducts()`, `getProductBySlug()`, etc. — no component changes needed
4. Categories and brands follow the same pattern via `lib/api/brands.ts`

### Database Introduction

To add a database (PostgreSQL, MySQL, etc.):
1. Create API routes in `src/app/api/` for CRUD operations
2. Update `lib/api/products.ts` to fetch from API instead of static data
3. Maintain the same function signatures — components remain unchanged

---

## Codebase Statistics

| Metric | Count |
|--------|-------|
| Routes | 19 |
| Source files (TS/TSX) | 98 |
| Components | 41 |
| UI Primitives | 18 |
| Providers | 4 |
| Hooks | 1 |
| Pages | 19 |
| E2E test files | 11 |
| E2E tests | 32 |
| Total LOC (src) | ~6,500 |
| Runtime dependencies | 6 |
| Dev dependencies | 10 |

### Server vs Client

| Type | Count |
|------|-------|
| Server Components | ~40 |
| Client Components | ~22 |
| SSG Pages | 5 routes (27 pages) |
| Dynamic Pages | 5 routes |

---

## Developer Notes

### Design Decisions

1. **No state management library** — Cart/Wishlist/Compare are 294 lines total with Context + useReducer. Adding Redux or Zustand for 3 stores with 4-5 actions each would be over-engineering at this scale.

2. **Pagination is link-based, not callback-based** — The Pagination component accepts `baseUrl` + `params` (serializable) instead of `hrefBuilder` (function). This avoids Server→Client function boundary violations while keeping the component interactive.

3. **API layer exists even though data is static** — `lib/api/products.ts` may seem redundant when data lives in `lib/data/products.ts`, but it's a migration seam. When data moves to a CMS/API/database, only the API layer changes.

4. **Tailwind v4 CSS-based config** — No `tailwind.config.ts`. All tokens are in `globals.css` via `@theme inline`. This is the Tailwind v4 convention.

### What NOT to Change

- **Do not import from `lib/data/` directly** — always go through `lib/api/`. The API layer is the migration seam for CMS/database.
- **Do not replace Context providers with external libraries** — the current implementation is 294 lines. A library would add 50KB+ for minimal benefit.
- **Do not convert Server Components to Client Components** unless interaction requires it. The default is Server.
- **Do not change the shared filter pipeline** — 5 listing pages depend on `filterByX → sortProducts → paginate`. Breaking this breaks all search/filter/sort.
