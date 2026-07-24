# Product Data, Search & Filtering Architecture

## 1. Product Data Architecture

### Data Ownership

```
lib/data/products.ts       ← Source of truth (static TypeScript array)
lib/data/categories.ts     ← Category tree
lib/data/brands.ts         ← Brand directory
        ↓
lib/api/products.ts        ← Query layer (filter, sort, search, paginate)
lib/api/categories.ts      ← Category lookups
lib/api/brands.ts          ← Brand lookups
lib/api/filters.ts         ← Filter option computation
        ↓
Server Components           ← Consume via direct function calls
```

### Why Static TypeScript Arrays (not JSON, not CMS)

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **JSON files** | Human-readable, no TS compilation | No type safety, no autocomplete, no import validation | ❌ |
| **TypeScript arrays** | Type-safe, autocomplete, compile-time validation, importable | Must recompile on data changes | ✅ |
| **CMS/API** | Dynamic updates | Overkill for static recreation, adds latency | ❌ Future migration path |

### Product Data Shape

```typescript
// types/product.ts

interface Product {
  id: string;                              // 'p-001'
  slug: string;                            // 'panel-surya-mitsubishi-mje275fb-275wp'
  name: string;                            // 'Panel Surya Mitsubishi 275 Wp Mono (MJE275FB)'
  brandId: string;                         // 'b-mitsubishi'
  categoryId: string;                      // 'cat-panel-surya'
  subcategoryId?: string;                  // 'subcat-monocrystalline'
  images: string[];                        // ['/images/products/mitsubishi-275wp.webp', ...]
  price: number;                           // 1450000
  originalPrice?: number;                  // 2250000
  condition: ProductCondition;             // 'new-project-leftover'
  stock: number;                           // 3
  sku: string;                             // 'MITSUBISHI-MJE275FB'
  model?: string;                          // 'PV-MJE275FB'
  warranty: string;                        // '5 Tahun'
  description: string;                     // Markdown string
  specifications: Specification[];         // Key-value pairs
  documents?: ProductDocument[];
  badges: ProductBadgeVariant[];           // ['clearance', 'promo']
  affiliateCommission: { percent: 2.5; amount: 36250 };
  rating: number;                          // 0.0 to 5.0
  reviewCount: number;                     // 0
  weight: number;                          // 22.5 (kg)
  isActive: boolean;                       // true
  createdAt: string;                       // ISO date
}
```

### Relational Resolution

Data is stored with IDs (normalized), resolved at the API layer:

```typescript
// lib/api/products.ts

export function getProductBySlug(slug: string): ProductWithRelations | null {
  const product = products.find(p => p.slug === slug);
  if (!product) return null;

  return {
    ...product,
    brand: brands.find(b => b.id === product.brandId)!,
    category: categories.find(c => c.id === product.categoryId)!,
    subcategory: product.subcategoryId
      ? categories.find(c => c.id === product.subcategoryId)
      : undefined,
  };
}
```

This avoids circular references (Product → Brand → Product) in the static data and keeps the data store flat.

### Product Counts

```typescript
// Actual energi.click catalog (approximate):
// ~30-40 products across 9 categories
// ~10 brands

// Each product entry: ~30 lines of TypeScript
// Total data file: ~1200 lines (well within maintainable range)
// No pagination performance concern at this scale
```

---

## 2. Search Architecture

### Search Flow

```
User types in SearchBar
    ↓ (on submit OR debounced 300ms after typing)
Navigate to /cari?q={query}
    ↓
Search page reads searchParams.q
    ↓
Calls searchProducts(query) from lib/api/products.ts
    ↓
Returns Product[] ranked by relevance
    ↓
Rendered in ProductGrid
```

### Search Algorithm

Since the catalog is small (~40 products), full client-side search with server-side rendering:

```typescript
// lib/api/products.ts

export function searchProducts(query: string): Product[] {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);  // "panel surya 275" → ['panel', 'surya', '275']

  return products
    .filter(p => p.isActive)
    .map(product => ({
      product,
      score: calculateRelevance(product, terms),
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.product);
}

function calculateRelevance(product: Product, terms: string[]): number {
  let score = 0;
  const searchText = [
    product.name,
    product.brandId,      // resolved to brand name before indexing
    product.categoryId,   // resolved to category name before indexing
    product.sku,
    product.model ?? '',
    ...product.specifications.map(s => s.value),
  ].join(' ').toLowerCase();

  for (const term of terms) {
    if (searchText.includes(term)) {
      // Exact match in name = highest weight
      if (product.name.toLowerCase().includes(term)) score += 10;
      // Match in SKU/model = high weight
      if (product.sku.toLowerCase().includes(term)) score += 8;
      // Match in category/brand = medium weight
      if (searchText.includes(term)) score += 5;
      // Multi-word match bonus
      if (terms.length > 1) score += 2;
    }
  }

  return score;
}
```

### Search Index

No pre-built search index needed at 40 products. A linear scan with string matching takes <1ms. If the catalog grows to 500+ products, add a precomputed search index array:

```typescript
// Future optimization (not needed now):
interface SearchIndexEntry {
  productId: string;
  text: string;  // Pre-computed lowercase concatenation
}
const searchIndex: SearchIndexEntry[] = products.map(p => ({
  productId: p.id,
  text: buildSearchText(p).toLowerCase(),
}));
```

### No External Search Library

- **Fuse.js**: Adds 5KB bundle, great for fuzzy search, but overkill at 40 products
- **Lunr.js**: 8KB, full-text search, overkill
- **Custom**: 30 lines of code, instant at this scale, zero dependencies

**Decision: Custom string scoring. No search library.**

---

## 3. Filtering Architecture

### Filter State Lives in URL

```
/kategori/panel-surya?brand=b-mitsubishi,b-longi&min=1000000&max=3000000&kondisi=new-project-leftover&rating=4&sort=price-asc
```

**Why URL params:**
- Shareable/bookmarkable filter combinations
- Back/forward browser navigation works
- Server Components can read filters at render time (no client hydration needed for initial state)
- No stale state between page navigations

### Filter Categories

| Filter Group | URL Param | Type | Values |
|-------------|-----------|------|--------|
| Price Range | `min`, `max` | number | 0–999999999 |
| Brand | `brand` | string[] (comma-separated IDs) | b-mitsubishi, b-longi, ... |
| Condition | `kondisi` | string[] (comma-separated) | new, new-minor-defect, new-project-leftover, open-box, display, used |
| Rating | `rating` | number | 3 or 4 (meaning 3+ or 4+) |
| In Stock | `stok` | boolean (presence) | 1 |
| Ready to Ship | `siap` | boolean (presence) | 1 |
| On Promo | `promo` | boolean (presence) | 1 |
| New Product | `baru` | boolean (presence) | 1 |
| Clearance | `clearance` | boolean (presence) | 1 |
| Needs Quote | `penawaran` | boolean (presence) | 1 |
| Sort | `sort` | enum | relevance, newest, price-asc, price-desc, rating, bestseller, most-viewed, biggest-discount |
| Page | `page` | number | 1–N |
| Search | `q` | string | free text |

### Filter Options Computation

Filter options (available brands, price range, condition counts) are computed from the CURRENT result set, not the full catalog:

```typescript
// lib/api/filters.ts

export function getFilterOptions(
  products: Product[],
  currentFilters: ProductFilters
): FilterOptions {

  // Brand options: only brands present in current results
  const brandCounts = new Map<string, number>();
  for (const p of products) {
    brandCounts.set(p.brandId, (brandCounts.get(p.brandId) ?? 0) + 1);
  }

  return {
    brands: Array.from(brandCounts.entries()).map(([id, count]) => ({
      id,
      name: getBrandById(id)!.name,
      count,
    })),
    priceRange: {
      min: Math.min(...products.map(p => p.price)),
      max: Math.max(...products.map(p => p.price)),
    },
    conditions: PRODUCT_CONDITIONS.map(c => ({
      value: c,
      label: CONDITION_LABELS[c],
      count: products.filter(p => p.condition === c).length,
    })).filter(c => c.count > 0),
  };
}
```

### Filter Application Pipeline

```
1. Start with all active products (or category-filtered)
    ↓
2. Apply brand filter          → .filter(p => brandIds.includes(p.brandId))
    ↓
3. Apply price range           → .filter(p => p.price >= min && p.price <= max)
    ↓
4. Apply condition             → .filter(p => kondisi.includes(p.condition))
    ↓
5. Apply rating                → .filter(p => p.rating >= rating)
    ↓
6. Apply boolean flags         → .filter(p => matchesFlags(p, flags))
    ↓
7. Apply search query          → searchProducts(query) [or pre-filtered set]
    ↓
8. Apply sort                  → .sort(sortComparator(sort))
    ↓
9. Paginate                    → .slice((page-1) * perPage, page * perPage)
    ↓
10. Return { products, total, page, totalPages, filterOptions }
```

### Filter Implementation

```typescript
// lib/api/filters.ts

export function applyFilters(
  products: Product[],
  filters: ProductFilters
): Product[] {
  let result = [...products];

  if (filters.brandIds?.length) {
    result = result.filter(p => filters.brandIds!.includes(p.brandId));
  }

  if (filters.priceMin != null) {
    result = result.filter(p => p.price >= filters.priceMin!);
  }

  if (filters.priceMax != null) {
    result = result.filter(p => p.price <= filters.priceMax!);
  }

  if (filters.conditions?.length) {
    result = result.filter(p => filters.conditions!.includes(p.condition));
  }

  if (filters.minRating != null) {
    result = result.filter(p => p.rating >= filters.minRating!);
  }

  // Boolean flags
  if (filters.inStock) {
    result = result.filter(p => p.stock > 0);
  }
  if (filters.onPromo) {
    result = result.filter(p => p.badges.includes('promo'));
  }
  if (filters.isNew) {
    result = result.filter(p => p.badges.includes('new'));
  }
  if (filters.isClearance) {
    result = result.filter(p => p.badges.includes('clearance'));
  }

  return result;
}

export function sortProducts(
  products: Product[],
  sort: SortOption
): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'biggest-discount':
      return sorted.sort((a, b) =>
        (b.originalPrice ?? b.price) - b.price -
        ((a.originalPrice ?? a.price) - a.price)
      );
    case 'bestseller':
    case 'most-viewed':
      // Mock: fall back to rating for static data
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'relevance':
    default:
      return sorted; // Preserve search relevance order
  }
}
```

### Filter Sidebar → URL Sync

```
User checks "Mitsubishi Electric" checkbox
    ↓
FilterSidebar updates local state
    ↓
User clicks "Tampilkan N Produk" button
    ↓
Build new URLSearchParams from filter state
    ↓
router.push(`/kategori/panel-surya?${params}`)
    ↓
Page re-renders with new searchParams
    ↓
Server Component reads searchParams, applies filters, returns new Product[]
    ↓
Filter sidebar re-computes available options from new result set
```

### Performance

At 40 products, all filtering is instant. No need for:
- Debounced filter updates (instant is fine)
- Web Workers (40 array.filter calls = <1ms)
- Memoization (React will re-render based on URL changes, not filter calculations)
- Server-side filtering API (all data is already in the static bundle)

---

## URL Param Serialization

```typescript
// lib/utils/params.ts — helper for reading/writing URL filter params

export function parseFiltersFromParams(
  searchParams: Record<string, string | string[] | undefined>
): ProductFilters {
  return {
    brandIds: parseArrayParam(searchParams.brand),
    priceMin: parseNumberParam(searchParams.min),
    priceMax: parseNumberParam(searchParams.max),
    conditions: parseArrayParam(searchParams.kondisi) as ProductCondition[],
    minRating: parseNumberParam(searchParams.rating),
    inStock: hasParam(searchParams.stok),
    readyToShip: hasParam(searchParams.siap),
    onPromo: hasParam(searchParams.promo),
    isNew: hasParam(searchParams.baru),
    isClearance: hasParam(searchParams.clearance),
    needsQuote: hasParam(searchParams.penawaran),
    searchQuery: typeof searchParams.q === 'string' ? searchParams.q : undefined,
  };
}

export function filtersToParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.brandIds?.length) params.set('brand', filters.brandIds.join(','));
  if (filters.priceMin != null) params.set('min', String(filters.priceMin));
  if (filters.priceMax != null) params.set('max', String(filters.priceMax));
  if (filters.conditions?.length) params.set('kondisi', filters.conditions.join(','));
  if (filters.minRating) params.set('rating', String(filters.minRating));
  if (filters.inStock) params.set('stok', '1');
  if (filters.readyToShip) params.set('siap', '1');
  if (filters.onPromo) params.set('promo', '1');
  if (filters.isNew) params.set('baru', '1');
  if (filters.isClearance) params.set('clearance', '1');
  if (filters.needsQuote) params.set('penawaran', '1');
  if (filters.searchQuery) params.set('q', filters.searchQuery);
  return params;
}
```

---

## Summary

| Architecture | Decision | Scale Assumption |
|-------------|----------|-----------------|
| Data store | TypeScript arrays with ID-based relations | ~40 products, ~10 brands, ~9 categories |
| Data access | API layer resolves relations at read time | No circular references |
| Search | Custom string scoring (30 lines) | <1ms at 40 products |
| Filters | URL params → API layer → array.filter chain | <1ms at 40 products |
| Filter options | Computed from result set (not full catalog) | Prevents dead-end filters |
| Sort | Client-side array.sort() | Instant |
| Pagination | .slice() at end of pipeline | 12 per page |
| No dependencies | No Fuse.js, no Lunr, no search library | Zero bundle cost |
