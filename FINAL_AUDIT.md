# Production Readiness Audit — EnergyV1

**Audit Date**: 2026-07-22  
**Codebase**: EnergyV1 (Next.js 16, React 19, Tailwind 4)  
**Audit Scope**: 18 routes, 25 Client Components, ~85 source files

---

# Executive Summary

**Launch Readiness Score: 71/100**

**Recommendation: READY WITH CONDITIONS** — 5 P0 items must be resolved before production deploy.

| Category | Score | Status |
|----------|-------|--------|
| Routing | 80/100 | Missing custom 404 |
| SEO | 65/100 | Structured data unused, no canonical on 2 pages |
| Performance | 75/100 | Reasonable image config, 25 client components |
| Architecture | 70/100 | 6 files bypass API layer, ISR only on 2 routes |
| Forms | 85/100 | RFQ validation fixed, checkout validates |
| State | 85/100 | ComparePage hydration fixed, localStorage safe |
| Testing | 80/100 | 28 tests, 0 false positives (audited) |
| Accessibility | 70/100 | ARIA labels present, no keyboard-only testing |
| Security | 80/100 | URL params validated, no user content XSS risk |
| Deployment | 75/100 | Build passes, no error tracking, no CSP |

---

# P0 — Launch Blockers (Must Fix Before Deploy)

| # | Issue | File | Impact | Fix | Effort |
|---|-------|------|--------|-----|--------|
| 1 | **No custom 404 page** | `src/app/not-found.tsx` missing | Users see Next.js default 404 — broken branding, no navigation recovery | Create `not-found.tsx` with breadcrumb, search bar, "Kembali ke Beranda" link, product category links | 15 min |
| 2 | **Structured data components built but NEVER used in pages** | `src/components/ui/StructuredData.tsx` | 5 schema types (BreadcrumbList, ItemList, FAQPage, Article, Organization) exist — only OrganizationSchema is used. Google sees zero rich snippets on category, FAQ, article pages. | Add `<BreadcrumbListSchema />` to category/product pages. Add `<ItemListSchema />` to category page. Add `<FAQPageSchema />` to FAQ page. Add `<ArticleSchema />` to article detail. | 30 min |
| 3 | **6 files bypass API layer importing products directly** | `brand/page.tsx`, `brand/[slug]/page.tsx`, `perbandingan/page.tsx`, `produk/[slug]/page.tsx`, `wishlist/page.tsx`, `page.tsx` | When products move to JSON/CMS, 6 files must be updated individually. `lib/api/products.ts` exists but is ignored by half the codebase. | Replace `from '@/lib/data/products'` with `from '@/lib/api/products'` in all 6 files | 10 min |
| 4 | **No canonical URL on homepage and search page** | `app/page.tsx`, `app/cari/page.tsx` | `/` and `/cari?q=panel` treated as separate pages by Google. Duplicate content risk. | Add `alternates: { canonical: '/' }` to homepage metadata. Add `alternates: { canonical: '/cari' }` to search metadata generator | 5 min |
| 5 | **ISR revalidation missing on article, brand, and static page routes** | `artikel/[slug]/page.tsx`, `brand/[slug]/page.tsx`, `halaman/[slug]/page.tsx` | Content updates require full redeploy. Product pages have ISR — these don't. | Add `export const revalidate = 3600` to all 3 SSG routes | 5 min |

---

# P1 — High Priority (Should Fix in First Week)

| # | Issue | File | Impact | Fix | Effort |
|---|-------|------|--------|-----|--------|
| 6 | **Robots.txt `Disallow` on `/cari?*` is invalid syntax** | `src/app/robots.ts` | Robots.txt spec does not support wildcard query params in Disallow directives. Google may index search result pages. | Change to `/cari?` (strips query params) or use `noindex` meta tag in search page (already present ✅) | 5 min |
| 7 | **No Open Graph images on category/article/static pages** | `kategori/[slug]/page.tsx`, `artikel/[slug]/page.tsx` | Social shares of category/article pages show no preview image. Product pages have OG images — these don't. | Use the first product image for category OG, or a generic site banner | 15 min |
| 8 | **25 Client Components — some avoidable** | Various | SearchBar, NewsletterForm, FloatingWhatsApp, HeroSlider, SortDropdown are 'use client' for single events that could use Server Actions or form actions | Not blocking, but increases JS bundle. HeroSlider must stay client (timer). FloatingWhatsApp is a static link — could be server. | Review each; 3-5 could be converted | 30 min |
| 9 | **369-line RFQ page — no component extraction** | `permintaan-penawaran/page.tsx` | Single file with contact form, project form, item management, validation, confirmation, WhatsApp generation — 5 concerns in 1 file | Split into `RfqContactForm`, `RfqProjectForm`, `RfqItemList`, `RfqConfirmation` components | 45 min |
| 10 | **No loading.tsx on dynamically rendered pages** | `cari/`, `promo/`, `barang-clearance/`, `brand/[slug]/`, `permintaan-penawaran/` | Slow network → blank page while server renders. Product and category pages have loading.tsx — these don't. | Add skeleton loading states matching page layout | 20 min per page |

---

# P2 — Improvements (Within First Month)

| # | Issue | File | Impact | Fix | Effort |
|---|-------|------|--------|-----|--------|
| 11 | **No CSP header** | `next.config.ts` | No Content Security Policy — XSS protection relies entirely on code quality, not browser enforcement | Add `Content-Security-Policy` header in next.config.ts headers | 15 min |
| 12 | **No Google Analytics integration** | Root layout | No analytics tracking whatsoever — no GA4 script, no conversion events | Add `@next/third-parties/google` or `<Script>` tag for GA4 | 15 min |
| 13 | **No error tracking** | Project config | Client-side errors silently lost. No Sentry, no Vercel Observability configured | Add `@sentry/nextjs` or enable Vercel Observability | 30 min |
| 14 | **No `<title>` fallback on 404** | `not-found.tsx` (doesn't exist) | Default 404 shows "404: This page could not be found" — no Indonesian localization | Create custom 404 with Indonesian copy | Included in P0 #1 |
| 15 | **Placeholder images in production data** | `lib/data/products.ts` | All 8 products use `/images/placeholder/product-placeholder.png` — a gray 400×400 square. No real product images. | Replace with actual product photos from energi.click storage | Content task |
| 16 | **ComparePage hydration mismatch patched, not solved** | `perbandingan/page.tsx` | `hydrated` state guard prevents SSR mismatch but causes flash-of-empty-state before real content renders. Users see "Perbandingan Produk" heading briefly before content appears. | Use `useSyncExternalStore` or Next.js `dynamic(() => import(...), { ssr: false })` to skip SSR for ComparePage entirely | 15 min |

---

# P3 — Nice-to-Have

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 17 | Sitemap changefreq/priority values could be tuned | Minor — Google largely ignores these | 5 min |
| 18 | No `hreflang` tags | Site is Indonesian-only — no lang alternates needed today | 5 min if needed |
| 19 | No PWA manifest | No install-to-home-screen support | 15 min |
| 20 | No service worker | No offline support | 30 min |

---

# Test Coverage Analysis

### Coverage by Route

| Route | Tests | Happy Path | Edge Cases | Persistence | Mobile | False Positives |
|-------|-------|-----------|------------|-------------|--------|-----------------|
| `/` Homepage | 4 | ✅ | ❌ carousels, hamburger | N/A | ❌ | 0 |
| `/produk/[slug]` | 4 | ✅ | ❌ gallery, zoom, compare | N/A | ❌ | 0 |
| `/kategori/[slug]` | 4 | ✅ | ❌ subcategory | N/A | ❌ | 0 |
| `/cari` | 4 | ✅ | ❌ special chars | N/A | ❌ | 0 |
| `/brand` | 2 | ✅ | ❌ 0 products | N/A | ❌ | 0 |
| `/promo` | 0 | ❌ | ❌ | N/A | ❌ | N/A |
| `/barang-clearance` | 0 | ❌ | ❌ | N/A | ❌ | N/A |
| `/artikel` | 4 | ✅ | ❌ 404 | N/A | ❌ | 0 |
| `/faq` | 3 | ✅ | N/A | N/A | ❌ | 0 |
| `/afiliasi` | 0 | ❌ | ❌ | N/A | ❌ | N/A |
| `/permintaan-penawaran` | 4 | ✅ | ✅ import, validation | N/A | ❌ | 0 |
| `/halaman/[slug]` | 0 | ❌ | ❌ | N/A | ❌ | N/A |
| `/wishlist` | 3 | ✅ | N/A | ❌ refresh | ❌ | 0 |
| `/perbandingan` | 3 | ✅ | ✅ max-4 | ❌ refresh | ❌ | 0 |
| `/keranjang` | 3 | ✅ | ✅ qty, remove | ✅ refresh | ❌ | 0 |
| `/checkout` | 4 | ✅ | ✅ validation, back | N/A | ❌ | 0 |

**Overall**: 28 tests, 0 known false positives. 10/18 routes tested (56%). 6 routes with zero coverage. 0 mobile viewport tests.

### Missing Coverage (by risk)

| Risk | Routes |
|------|--------|
| 🔴 Untested routes | `/promo`, `/barang-clearance`, `/afiliasi`, `/halaman/*` |
| 🟡 No mobile tests | ALL — 0 tests use `{ viewport: { width: 375, height: 812 } }` |
| 🟡 No persistence refresh tests | Wishlist, Compare |
| 🟢 Missing edge cases | Product gallery zoom, category subcategories, search special chars, brand 0-products |

---

# SEO Analysis

| Check | Status | Detail |
|-------|--------|--------|
| sitemap.xml | ✅ | Auto-generated, 54+ URLs |
| robots.txt | ⚠️ | `/cari?*` pattern may not work per spec |
| metadataBase | ✅ | Set in root layout |
| Canonical URLs | ⚠️ | Missing on `/` and `/cari` — 2 pages without canonical |
| Open Graph | ⚠️ | Product pages only. Category/article pages lack OG images |
| Twitter Cards | ✅ | `summary_large_image` in root layout |
| JSON-LD Product | ✅ | Product detail pages |
| JSON-LD Organization | ✅ | Homepage only |
| JSON-LD BreadcrumbList | ❌ | Component built, NOT used in any page |
| JSON-LD ItemList | ❌ | Component built, NOT used in any page |
| JSON-LD FAQPage | ❌ | Component built, NOT used in FAQ page |
| JSON-LD Article | ❌ | Component built, NOT used in article pages |
| noindex on private pages | ⚠️ | Checkout has noindex via layout. Search has noindex. Cart/Wishlist/Compare lack noindex |
| Breadcrumb UI | ✅ | All content pages have breadcrumb navigation |
| title template | ✅ | `%s — Energi.Click` in root layout |

---

# Performance Analysis

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Source files | ~85 | N/A | Acceptable |
| Client Components | 25 | <20 ideal | ⚠️ High for content site |
| Largest file | 369 lines (RFQ) | <200 lines | ⚠️ Needs splitting |
| Image config | ✅ WebP, deviceSizes, imageSizes, 30-day cache | — | ✅ Good |
| Images with `sizes` | 5 occurrences | Should be on every `<Image>` | ⚠️ Low coverage |
| `priority` on LCP images | 2 (hero + product gallery) | Hero ✅ | All hero images and first-row product cards should have priority |
| Tree-shaking risk | 6 files import products directly | 0 ideal | ⚠️ Product array bundled 6 times |
| ISR coverage | 2/18 routes | Product + category pages | ⚠️ Article, brand, static pages lack ISR |
| Build output | 54 pages, ~2.5s build | Acceptable | ✅ |

---

# Security Analysis

| Check | Status | Detail |
|-------|--------|--------|
| XSS via URL params | ✅ Safe | All params validated or cast with fallback |
| XSS via user input | ✅ Safe | No user content stored/rendered yet (reviews, Q&A pending) |
| dangerouslySetInnerHTML | ✅ Safe | Only on JSON-LD from trusted TypeScript data sources |
| Input sanitization | ✅ Good | `encodeURIComponent` used for all URL params and WhatsApp messages |
| CSP header | ❌ Missing | No Content-Security-Policy header |
| `npm audit` | ⚠️ Not checked | Dependencies unverified for known vulnerabilities |
| Form validation | ✅ Good | RFQ validates email/required/items. Checkout validates shipping fields. |
| localStorage | ✅ Safe | SSR-safe reads (try/catch), no secrets stored |
| API routes | N/A | No API routes — fully static site |

---

# Deployment Checklist

| # | Item | Status |
|---|------|--------|
| 1 | Production build passes locally | ✅ `npm run build` exits 0 |
| 2 | `next.config.ts` configured | ✅ Image optimization set |
| 3 | Environment variables documented | ⚠️ Only 2 vars (`SITE_URL`, `WHATSAPP`), but no `.env.example` file |
| 4 | Vercel project created | ❌ Not configured |
| 5 | Domain connected | ❌ energi.click DNS not pointed |
| 6 | SSL provisioned | ❌ Vercel auto-provisions on deploy |
| 7 | Analytics integration | ❌ No GA4, no Vercel Analytics |
| 8 | Error monitoring | ❌ No Sentry, no Vercel Observability |
| 9 | CSP header | ❌ Not configured |
| 10 | Custom 404 page | ❌ Missing `not-found.tsx` |
| 11 | Product images | ❌ All 8 products use placeholder |
| 12 | Content review | ❌ Prices, stock, descriptions unverified |
| 13 | Legal pages reviewed | ❌ Terms, Privacy, Returns not legally reviewed |
| 14 | Sitemap submitted | ❌ Not submitted to Google |
| 15 | WhatsApp number configured | ⚠️ Uses default `6281234567890` |

---

# Exact Next Actions (Priority Order)

| # | Action | P | Effort |
|---|--------|---|------|
| 1 | Create `src/app/not-found.tsx` with custom 404 UI | P0 | 15 min |
| 2 | Add canonical to homepage (`/`) and search (`/cari`) metadata | P0 | 5 min |
| 3 | Add ISR revalidation to artikel, brand, halaman SSG routes | P0 | 5 min |
| 4 | Replace direct `@/lib/data/products` imports with `@/lib/api/products` in 6 files | P0 | 10 min |
| 5 | Use existing StructuredData components in category, FAQ, article pages | P0 | 30 min |
| 6 | Create `.env.example` file documenting required env vars | P1 | 5 min |
| 7 | Install `@next/third-parties/google` and add GA4 to root layout | P1 | 15 min |
| 8 | Install `@sentry/nextjs` or enable Vercel Observability | P1 | 30 min |
| 9 | Add CSP header to `next.config.ts` | P1 | 15 min |
| 10 | Split 369-line RFQ page into 4 components | P1 | 45 min |
