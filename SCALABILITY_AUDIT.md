# Scalability Audit — 8 → 100 → 1000+ Products

## 1. Search Architecture

### Current State

**No search page exists.** `SearchBar` navigates to `/cari?q=query` but no page at that route. Search is not implemented.

### At 8 products — N/A (not built)
### At 100 products — ⚠️ Bottleneck
### At 1000+ products — ❌ Blocked

| Scale | Problem |
|-------|---------|
| 8 | Fine — hasn't been built yet |
| 100 | Linear scan of 100 items in `products.filter()` = ~0.1ms. Fine. |
| 1000 | Linear scan = ~1ms. Still fine for server. But the product array is in a TS file — the ENTIRE array is bundled into the server bundle. At ~250 lines/products × 1000 = 250KB of product data in the server bundle. This bloats every page render. |
| 5000+ | Linear scan + bundle size = actual problem. Need data outside the bundle. |

### Bottleneck Identified

**Product data is IN the application bundle.** Every `import { products } from '@/lib/data/products'` loads the full array into memory for every page that imports it. At 1000 products, this is ~250KB of JSON parsed into JS objects on every request. At 10,000 products, it's 2.5MB — server OOM risk.

### Fix Required (Not Blocking for Phase 4)

At 100 products, add a lightweight data access layer that:
1. Keeps products in a separate JSON file (not TS array)
2. Loads it once with `fs.readFileSync` at module init (cached)
3. Tree-shakes: only the API functions are imported, not the data

For Phase 4, with <20 products:
- Build a simple `lib/api/search.ts` that wraps `products.filter()`
- Acceptable to keep data in TS for now
- Add todo comment noting JSON migration at 100+ products

---

## 2. Filtering Architecture

### Current State

Filter logic is **inline in category page** (lines 62-68):

```typescript
let categoryProducts = products.filter(
  (p) => p.categoryId === category.id || p.subcategoryId === category.id
);
```

No `lib/api/filters.ts` exists despite being planned in the blueprint. The `FilterSidebar` component doesn't exist. `SortDropdown` is the only filter UI.

### At 8 → 1000 products — Same bottleneck

The filter chain is fine conceptually (array.filter chaining). The problem is:
- **Filter options computation**: `getFilterOptions()` would scan all 1000 products to compute brand counts, price ranges, condition counts. Acceptable once per page render.
- **No debouncing**: User changing filters triggers a full page navigation (URL params → server render). At 1000 products, each server render scans the full array. Fine — it's a server operation, not client.

### Missing

| Component | Blueprint | Actual | Status |
|-----------|-----------|--------|--------|
| `FilterSidebar.tsx` | ✅ Planned | ❌ Missing | Phase 4 |
| `PriceRangeFilter.tsx` | ✅ Planned | ❌ Missing | Phase 4 |
| `FilterCheckboxGroup.tsx` | ✅ Planned | ❌ Missing | Phase 4 |
| `ActiveFilters.tsx` | ✅ Planned | ❌ Missing | Phase 4 |
| `lib/api/filters.ts` | ✅ Planned | ❌ Missing | Phase 4 |

---

## 3. Product Catalog Growth

### Current: 8 products, 1 array, 1 file

```typescript
// src/lib/data/products.ts — 246 lines, 7.9KB
export const products: Product[] = [ ... 8 items ... ];
```

### At 100 products — 2500 lines, 80KB

- `generateStaticParams()` builds 100 product pages — adds ~8s to build time
- Still manageable. Bundle size acceptable.
- Single TS file is unmaintainable for editing (editing product #73 requires scrolling through 72 others)

### At 1000 products — ❌ Bottleneck

- `generateStaticParams()` builds 1000 pages — 80+ seconds at build time
- 250KB of data in server bundle — every page render parses this
- TS file is 25,000 lines — impossible to maintain
- Git diffs for product updates are monstrous

### Fix Required (Before 100 Products)

**Split products into individual files** OR **move to JSON**:

```
lib/data/
  products/
    index.ts          # Aggregator — imports all, exports array
    p-001.ts          # One product per file
    p-002.ts
    ...
```

This keeps the current TS type safety while making each product editable independently. The aggregator handles the merge.

**For Phase 4**: Keep the single file (we're at 8-20 products). Add the split at Phase 5 when approaching 50 products.

---

## 4. Brand Architecture

### Current: 10 brands, 1 array

```typescript
export const brands: Brand[] = [ ... ];
export function getBrandById(id: string): Brand | undefined { ... }
```

### Problem: `getBrandById()` is called from 3+ components

| Component | Calls per render |
|-----------|-----------------|
| `ProductCard` | 1 per card (O(n) scan of brands array) |
| Product detail page | 1 |
| Wishlist page | N per product |
| Compare page | N per product |

At 8 products: 8 × 10 = 80 lookups. Fine.  
At 100 products on a category page: 100 × 100 brands = 10,000 array.finds. Bad.

### Fix (Now, Not Later)

**Pre-index brands by ID at data load time:**

```typescript
// Map<id, Brand> — O(1) lookup instead of O(n) array.find
const brandMap = new Map(brands.map(b => [b.id, b]));
export function getBrandById(id: string) { return brandMap.get(id); }
```

This is a 3-line change that prevents quadratic behavior. Do it now.

---

## 5. Pagination Strategy

### Current: Inline pagination links in category page

```tsx
{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
  <Link href={`/kategori/${slug}?sort=${sort}&page=${p}`}>...</Link>
))}
```

No `Pagination` component used despite having one in `ui/Pagination.tsx`.

### At 100 products (9 pages) → 9 links, fine
### At 1000 products (84 pages) → 84 links rendered, ugly

### Fix

Replace inline links with `Pagination` component which handles ellipsis. Already built (`ui/Pagination.tsx`). Just not used.

---

## 6. CMS Migration Path

### Current: TypeScript arrays → direct import

```typescript
import { products } from '@/lib/data/products';
// products is a TS const array, bundled into the server
```

### Migration Steps (When Time Comes)

```
Phase 1-4 (now):      TypeScript arrays, direct import
Phase 5 (50+ products):  Split into individual files, add Map indexes
Phase 6 (200+ products): Move to JSON files, fs.readFileSync at boot
Phase 7 (1000+ products): External API / headless CMS
```

### Tight Coupling to Fix Now

| Coupling | Risk | Fix |
|----------|------|-----|
| `getBrandById()` called directly in 4 components | Can't change brand data source without touching 4 files | Wrap in `lib/api/brands.ts` |
| Product filtering inline in page | Logic duplicated if search page needs same filters | Move to `lib/api/filters.ts` |
| `generateStaticParams()` maps all products | 1000 pages at build time | Add `dynamicParams` or switch to ISR-only |
| Category `productCount` is hardcoded | Must update count manually when adding products | Derive from products array |

---

## Action Items

### Fix NOW (Phase 4) — No Brainers

1. **Pre-index brands**: Add `Map<string, Brand>` for O(1) lookups — 3 lines
2. **Create `lib/api/filters.ts`**: Extract filter/sort logic from category page — prevents duplication when search page needs it
3. **Create `lib/api/brands.ts`**: Wrap brand data access — decouples components from data source

### Fix SOON (Phase 5, ~50 products)

4. **Split products.ts** into `products/p-*.ts` individual files
5. **Pre-index products** the same way as brands (Map<string, Product>)
6. **Use Pagination component** in category page (it's already built)

### Fix LATER (Phase 6-7, 100+ products)

7. Move to JSON files from TS files
8. Add `revalidate` for ISR on category pages
9. Consider headless CMS for non-technical product management
