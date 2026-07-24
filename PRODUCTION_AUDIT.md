# Production Readiness Audit — EnergyV1

## P0 — Critical (Blocks Launch)

### 1. Missing SEO Discovery Files

**sitemap.xml**: Not generated. Search engines have no way to discover pages.
**robots.txt**: Not generated. No crawling directives.
**sitemap.ts**: Not implemented. Next.js built-in `sitemap.ts` support unused.

**Impact**: Google cannot index any page. Site is invisible to search.
**Fix**: 
```
src/app/sitemap.ts        → generates sitemap.xml at build
public/robots.txt          → Allow: /, Sitemap: URL
```
**Effort**: 30 min. **Priority**: P0.

---

### 2. Pagination Component Built But Never Used

`ui/Pagination.tsx` (90 lines) was built in Phase 1. It handles ellipsis, prev/next, accessibility. **Not used anywhere.** Instead, 4 pages duplicate the same inline pagination UI:

```
src/app/kategori/[slug]/page.tsx:91
src/app/cari/page.tsx:82
src/app/promo/page.tsx:55
src/app/barang-clearance/page.tsx:54
```

All 4 pages have this exact pattern:
```tsx
{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
  <Link href={...}>...</Link>
))}
```

**Impact**: Code duplication, no ellipsis at 10+ pages, no accessibility on pagination controls.
**Fix**: Replace all 4 inline blocks with `<Pagination current={page} total={totalPages} onChange={...} />`.
**Effort**: 20 min. **Priority**: P0.

---

### 3. Zero Tests

No unit tests, integration tests, or E2E tests. No vitest/jest config.

**Impact**: No regression safety. Every change risks breaking existing functionality.
**Fix**: Minimum viable test suite:
- Unit: `lib/api/filters.test.ts` (filter, sort, paginate, search — pure functions)
- Unit: `providers/CartProvider.test.tsx` (reducer logic)
- E2E: Playwright smoke test (homepage loads, product detail renders, search works)
**Effort**: 4 hours. **Priority**: P0.

---

### 4. Empty next.config.ts — No Image Optimization

```typescript
const nextConfig: NextConfig = {
  /* config options here */   // ← Empty
};
```

Missing:
- `images.formats` — no WebP/AVIF auto-conversion
- `images.deviceSizes` — no responsive image breakpoints
- `images.imageSizes` — no fixed-size optimization
- `images.minimumCacheTTL` — no CDN caching for optimized images

**Impact**: All images served at original size. 1254×1254 WebP product images loaded for 80px thumbnails. LCP penalty.
**Fix**:
```typescript
images: {
  formats: ['image/webp'],
  deviceSizes: [640, 768, 1024, 1280, 1536],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30,
}
```
**Effort**: 10 min. **Priority**: P0.

---

## P1 — High (Degrades Quality)

### 5. Structured Data Coverage — Incomplete

| Page | JSON-LD Expected | Implemented |
|------|-----------------|-------------|
| `/` (Homepage) | Organization | ❌ Missing |
| `/produk/[slug]` | Product | ✅ Present |
| `/kategori/[slug]` | ItemList | ❌ Missing |
| `/artikel/[slug]` | Article | ❌ Missing |
| `/faq` | FAQPage | ❌ Missing |
| All pages | BreadcrumbList | ❌ Missing |

**Impact**: No rich snippets in search results. Competitors with structured data outrank.
**Fix**: Add JSON-LD blocks to each page type. BreadcrumbList can be a shared component.
**Effort**: 2 hours. **Priority**: P1.

---

### 6. URL Parameter Validation — Unsafe Cast

All listing pages use `sp.sort as SortOption` with no runtime validation:

```typescript
const sort = (sp.sort as SortOption) ?? 'price-asc';
```

If a user crafts `?sort=malicious`, the cast doesn't validate — it passes an invalid value to `sortProducts()` which falls through to the `default` case. Safe for now (no error), but fragile.

**Fix**: Add a validation function:
```typescript
const VALID_SORTS = ['relevance', 'newest', 'price-asc', 'price-desc', 'rating', 'bestseller', 'most-viewed', 'biggest-discount'];
function validateSort(value: string | undefined): SortOption {
  return VALID_SORTS.includes(value ?? '') ? (value as SortOption) : 'price-asc';
}
```
**Effort**: 15 min. **Priority**: P1.

---

### 7. Checkout Form — No Client-Side Validation

Checkout form relies only on HTML `required` attributes. No JS validation for:
- Email format
- Phone format
- Minimum address length
- Payment method selection check

RFQ form has proper validation. Checkout doesn't.

**Fix**: Add validation matching RFQ form pattern.
**Effort**: 30 min. **Priority**: P1.

---

### 8. Direct Product Data Imports — Bypasses API Layer

10 files import `products` directly from `@/lib/data/products`:

```
app/kategori/[slug]/page.tsx
app/cari/page.tsx
app/promo/page.tsx
app/barang-clearance/page.tsx
app/produk/[slug]/page.tsx
app/wishlist/page.tsx
app/perbandingan/page.tsx
app/brand/[slug]/page.tsx
app/brand/page.tsx
components/product/ProductCard.tsx
```

This bypasses the `lib/api/filters.ts` abstraction. When products move to JSON/CMS, all 10 files must be updated.

**Fix**: Add `getAllProducts()` to `lib/api/products.ts`, route all consumers through it. Existing `filterByCategory/searchProducts` already work — just need the raw access.
**Effort**: 20 min. **Priority**: P1.

---

## P2 — Medium (Accumulates Debt)

### 9. FileUpload Component — Built, Never Used

`components/forms/FileUpload.tsx` was planned but never called. RFQ page has no file attachment support despite the blueprint specifying it.

**Fix**: Integrate into RFQ form OR remove the component.
**Effort**: 15 min. **Priority**: P2.

---

### 10. Duplicate Pagination UI in 4 Pages

Same `Array.from({ length: totalPages })` pattern repeated 4 times. The `Pagination` component exists but isn't used.

**Note**: Same as P0 item #2. Listed again because it's a code quality issue, not just missing functionality.

---

### 11. Article Detail — Manual Markdown Parsing

Article content is parsed line-by-line:
```typescript
article.content.split('\n').map((line, i) => {
  if (line.startsWith('## ')) { return <h2>... }
  if (line.startsWith('- ')) { return <li>... }
  ...
})
```

Fragile: misses edge cases (bold inside list items, nested content, code blocks).

**Fix**: Install `react-markdown` OR keep simple parsing but document that article content must follow a specific format.
**Effort**: 30 min (react-markdown) or 5 min (document limitation).
**Priority**: P2.

---

## P3 — Low (Polish)

### 12. NewsletterForm — No Backend

Footer newsletter form calls `e.preventDefault()` with no actual submission or validation.

**Fix**: Add basic email validation + TODO comment for backend integration.
**Effort**: 10 min. **Priority**: P3.

---

### 13. Product Grid Pattern Duplicated

`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4` appears 8 times across listing pages. Could be a `ProductGrid` wrapper component.

**Impact**: If the grid needs to change (e.g., 3 columns on tablet), 8 files need updating.
**Effort**: 15 min. **Priority**: P3.

---

## Summary: Remediation Plan (Ranked)

| # | Issue | Impact | Effort | Priority |
|---|-------|--------|--------|----------|
| 1 | Missing sitemap.xml + robots.txt | Site invisible to Google | 30 min | **P0** |
| 2 | Pagination component not used | 4× duplicated code, no ellipsis | 20 min | **P0** |
| 3 | Zero tests | No regression safety | 4 hours | **P0** |
| 4 | Empty next.config.ts | No image optimization | 10 min | **P0** |
| 5 | Incomplete structured data | No rich snippets | 2 hours | **P1** |
| 6 | Unsafe URL param validation | Fragile, no runtime guard | 15 min | **P1** |
| 7 | Checkout no client validation | Bad UX on submit | 30 min | **P1** |
| 8 | Direct product imports | 10 files bypass API layer | 20 min | **P1** |
| 9 | FileUpload unused | Dead code or missing feature | 15 min | **P2** |
| 10 | Manual markdown parsing | Fragile article rendering | 30 min | **P2** |
| 11 | Newsletter no submission | Incomplete feature | 10 min | **P3** |
| 12 | Product grid duplication | 8× repeated classes | 15 min | **P3** |

**Total P0-P1 effort**: ~8 hours. **Total all items**: ~10 hours.

### Recommended Batches

**Batch A (P0 — Launch Blockers, 5 hours):**
1. sitemap.xml + robots.txt
2. Replace inline pagination with component
3. next.config image optimization
4. Unit tests for filter/sort/paginate/search + CartProvider

**Batch B (P1 — Quality, 3 hours):**
5. Structured data (Organization, ItemList, Article, FAQPage, BreadcrumbList)
6. URL parameter validation
7. Checkout form validation
8. API layer for product access

**Batch C (P2-P3 — Polish, 2 hours):**
9. FileUpload integration or removal
10. Article markdown fix
11. Newsletter validation
12. ProductGrid component
