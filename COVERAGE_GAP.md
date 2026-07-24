# Test Coverage Gap Report — EnergyV1

## Coverage Summary

| | Count |
|---|---|
| Total routes | 18 |
| Routes tested | 12 (67%) |
| Routes untested | 5 (28%) |
| Total tests | 35 |
| Happy path coverage | ~60% |
| Edge case coverage | ~15% |
| Mobile viewport tests | 0% |

---

## Per-Route Analysis

### 1. `/` — Homepage ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Page loads with all sections visible | ✅ | — |
| Hero slider has indicators | ✅ | — |
| Header/footer present | ✅ | — |
| "Lihat Katalog" need card navigates to /produk | ✅ | — |
| Hero auto-rotates after 5 seconds | ❌ | Medium |
| Clearance carousel scrolls horizontally | ❌ | Low |
| Promo carousel scrolls horizontally | ❌ | Low |
| Mobile: hamburger menu opens and navigates | ❌ | High |

### 2. `/produk/[slug]` — Product Detail ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Title, price, SKU render | ✅ | — |
| Tabs switch content (Deskripsi → Spesifikasi → Pengiriman) | ✅ | — |
| Quantity selector increments | ✅ | — |
| "Tambah ke Keranjang" button present | ✅ | — |
| Add to cart + navigate to cart shows product | ✅ | — |
| Wishlist toggle persists across navigation | ✅ | — |
| Compare toggle works | ❌ | Medium |
| Image gallery: click thumbnail changes main image | ❌ | Medium |
| Image gallery: click-to-zoom opens modal | ❌ | Medium |
| Zoom modal closes on ESC / overlay click | ❌ | Low |
| Affiliate banner renders with correct commission | ❌ | Low |
| Related products section has matching-category products | ❌ | Low |
| Breadcrumb links navigate correctly | ❌ | Low |
| Share button copies URL to clipboard | ❌ | Low |
| Product JSON-LD is present in page source | ❌ | Medium |
| Mobile: single-column layout, gallery touch-swipe | ❌ | High |

### 3. `/kategori/[slug]` — Category ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Products render for a category | ✅ | — |
| Sort dropdown changes URL and ordering | ✅ | — |
| Breadcrumb renders | ✅ | — |
| Pagination navigates between pages | ❌ | High |
| Pagination shows ellipsis at 5+ pages | ❌ | Medium |
| Empty category shows empty state | ❌ | Low |
| Category with 0 products shows "Tidak ada produk" | ❌ | Medium |
| Subcategory filtering (parentId check) | ❌ | Medium |
| URL parameters survive page refresh | ❌ | Low |
| Mobile: single-column product grid | ❌ | Medium |

### 4. `/cari` — Search ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Search returns matching products | ✅ | — |
| Empty search shows guidance | ✅ | — |
| No results shows empty state + zero cards | ✅ | — |
| Sort reorders results by price | ✅ | — |
| Search with special characters (quotes, brackets) | ❌ | Medium |
| Search with 1 character (min-length validation) | ❌ | Low |
| Search with only whitespace (trimmed) | ❌ | Low |
| Pagination on search results | ❌ | Medium |
| URL-deep-link: navigate directly to /cari?q=inverter | ❌ | Low |

### 5. `/brand` + `/brand/[slug]` — Brand ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Brand directory lists all brands | ✅ | — |
| Brand page shows products | ✅ | — |
| Brand with 0 products shows empty state | ❌ | Medium |
| Brand page breadcrumb links back to /brand | ❌ | Low |
| Click brand card navigates to brand page | ❌ | Low |

### 6. `/promo` — NOT TESTED ⚠️

| Journey | Tested | Risk |
|---------|--------|------|
| Page loads with promo products | ❌ | **High** |
| All products have "promo" badge | ❌ | Medium |
| Sort works on promo listing | ❌ | Medium |
| Pagination on promo listing | ❌ | Medium |
| Empty state when no promo products | ❌ | Low |
| Canonical URL present | ❌ | Low |

### 7. `/barang-clearance` — NOT TESTED ⚠️

| Journey | Tested | Risk |
|---------|--------|------|
| Page loads with clearance products | ❌ | **High** |
| All products have "clearance" badge | ❌ | Medium |
| Sort works on clearance listing | ❌ | Medium |
| Pagination on clearance listing | ❌ | Medium |
| Empty state when no clearance products | ❌ | Low |

### 8. `/artikel` + `/artikel/[slug]` — Articles ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Article listing shows articles | ✅ | — |
| Article detail renders heading + content | ✅ | — |
| Related articles appear | ✅ | — |
| Breadcrumb navigation present | ✅ | — |
| Article JSON-LD structured data | ❌ | Medium |
| Read time and date are displayed | ❌ | Low |
| Click article card → navigate to detail | ❌ | Low |
| Non-existent article slug → 404 | ❌ | Low |

### 9. `/faq` — NOT TESTED ⚠️

| Journey | Tested | Risk |
|---------|--------|------|
| Page loads with FAQ items | ❌ | **High** |
| Click FAQ accordion expands content | ❌ | High |
| Contact CTA buttons visible (WhatsApp + Ajukan) | ❌ | Medium |
| FAQPage JSON-LD structured data | ❌ | Medium |

### 10. `/afiliasi` — NOT TESTED ⚠️

| Journey | Tested | Risk |
|---------|--------|------|
| Page loads with hero + benefits | ❌ | Medium |
| WhatsApp CTA button links to wa.me | ❌ | Medium |
| FAQ accordions expand | ❌ | Low |
| "Cara Kerja" steps render | ❌ | Low |

### 11. `/permintaan-penawaran` — RFQ ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Form renders all sections | ✅ | — |
| Empty submission shows validation errors | ✅ | — |
| Adding item appears in list | ✅ | — |
| Valid form → confirmation + WhatsApp link | ✅ | — |
| Import from cart button populates items | ❌ | **High** |
| Remove item from list | ❌ | Medium |
| Email format validation rejects invalid email | ❌ | Medium |
| Phone format validation | ❌ | Low |
| "Butuh instalasi" checkbox toggles | ❌ | Low |
| Back button returns to form from confirmation | ❌ | Low |
| Mobile: form layout, keyboard-friendly inputs | ❌ | Medium |

### 12. `/halaman/[slug]` — NOT TESTED ⚠️

| Journey | Tested | Risk |
|---------|--------|------|
| Static pages render (tentang-kami, kebijakan, etc.) | ❌ | **High** |
| Non-existent slug → 404 | ❌ | Low |
| Breadcrumb navigation | ❌ | Low |

### 13. `/wishlist` — Wishlist ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Empty state renders | ✅ | — |
| Adding from product page persists to wishlist | ✅ | — |
| Remove item from wishlist | ❌ | High |
| "Add to cart" from wishlist moves to cart | ❌ | **High** |
| Clear all removes all items | ❌ | Medium |
| Heart icon toggle (filled vs outline) | ❌ | Low |
| Empty state CTA navigates to /produk | ❌ | Low |

### 14. `/perbandingan` — Compare ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Empty state renders | ✅ | — |
| CTA link visible | ✅ | — |
| Add product to compare (max 4 limit) | ❌ | **High** |
| Products appear in comparison table | ❌ | High |
| Spec rows show correct data (Brand, Kondisi, Garansi) | ❌ | High |
| Remove item from compare | ❌ | Medium |
| "Add to cart" from compare | ❌ | Medium |
| Max 4 products enforced (5th product rejected) | ❌ | Medium |

### 15. `/keranjang` — Cart ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Empty state renders | ✅ | — |
| Adding product shows in cart | ✅ | — |
| Removing item returns to empty state | ✅ | — |
| Quantity increment/decrement updates subtotal | ❌ | **High** |
| Quantity capped at max stock | ❌ | Medium |
| Subtotal recalculates on quantity change | ❌ | High |
| "Lanjutkan ke Pembayaran" navigates to /checkout | ❌ | Medium |
| Multiple products in cart (mixed items) | ❌ | Medium |
| Cart persists after page refresh (localStorage) | ❌ | **High** |
| Cart persists after closing and reopening tab | ❌ | Medium |

### 16. `/checkout` — Checkout ✅

| Journey | Tested | Risk |
|---------|--------|------|
| Empty cart → empty state | ✅ | — |
| Cart items → shows shipping form + order summary | ✅ | — |
| 3-step navigation (shipping → payment → review) | ✅ | — |
| Form submission creates order | ❌ | **High** |
| Required field validation on shipping step | ❌ | High |
| Payment method selection persists | ❌ | Medium |
| "Kembali" button returns to previous step | ❌ | Medium |
| Order summary recalculates on quantity changes | ❌ | Low |

---

## Missing Tests by Category

### Missing Happy Paths (🔴 Critical)

| # | Route | Journey | Risk |
|---|-------|---------|------|
| 1 | Cart | Quantity change recalculates subtotal | High — core e-commerce |
| 2 | Cart | localStorage persistence survives refresh | High — data loss bug |
| 3 | Checkout | Form submission completes order | High — core flow |
| 4 | Checkout | Required field validation blocks advance | High — data quality |
| 5 | Wishlist | "Add to cart" from wishlist moves product | High — conversion path |
| 6 | Wishlist | Remove item from wishlist | High — basic CRUD |
| 7 | Compare | Add product → appears in table with specs | High — whole feature untested |
| 8 | Compare | Max 4 products enforced | High — core constraint |
| 9 | RFQ | Import from cart button works | High — key UX feature |
| 10 | Promo | Page loads with filtered results | High — page untested |
| 11 | Clearance | Page loads with filtered results | High — page untested |
| 12 | FAQ | Accordion expands on click | High — interactive feature |
| 13 | Static Pages | All 5 pages render | High — SEO content |
| 14 | Category | Pagination navigates between pages | High — listing UX |

### Missing Edge Cases (🟡 Medium)

| # | Route | Journey |
|---|-------|---------|
| 1 | Product | Image gallery: thumbnail click changes main image |
| 2 | Product | Click-to-zoom modal opens and closes |
| 3 | Product | JSON-LD structured data in page source |
| 4 | Cart | Quantity capped at max stock |
| 5 | Cart | Multiple products in cart simultaneously |
| 6 | Search | Special characters in query (XSS vector) |
| 7 | Search | Pagination on search results |
| 8 | Category | Subcategory filtering (parentId check) |
| 9 | Brand | Brand with 0 products shows empty state |
| 10 | RFQ | Email validation rejects "notanemail" |
| 11 | RFQ | Remove item from list |
| 12 | Compare | Remove item from compare |
| 13 | Compare | "Add to cart" from compare table |
| 14 | Checkout | Payment method selection persists |
| 15 | Checkout | "Kembali" button returns to previous step |

### Missing Persistence Tests (🔴 Critical)

| # | Journey | Risk |
|---|---------|------|
| 1 | Cart survives page refresh | Data loss |
| 2 | Cart survives tab close and reopen | Session loss |
| 3 | Wishlist survives page refresh | Data loss |
| 4 | Compare survives page refresh | Data loss |

### Missing Mobile Viewport Tests

| # | Journey |
|---|---------|
| 1 | Homepage: hamburger menu opens and navigates |
| 2 | Product: single-column layout, touch-friendly buttons |
| 3 | Category: single-column product grid |
| 4 | Cart: touch-friendly quantity controls |
| 5 | Checkout: form inputs keyboard-friendly |
| 6 | RFQ: form layout, keyboard-friendly inputs |

---

## Risk Matrix

| Risk | Count | Routes Affected |
|------|-------|----------------|
| 🔴 Critical (data loss / core flow untested) | 14 | Cart (4), Checkout (2), Wishlist (2), Compare (3), Promo, Clearance, FAQ, Static |
| 🟡 Medium (edge case / polish) | 15 | Product (3), Cart (2), Search (2), Category, Brand, RFQ (2), Compare (2), Checkout (2) |
| 🟢 Low (nice-to-have) | 8 | Across all routes |

### Top 5 Highest-Priority Gaps

1. **Cart localStorage persistence** — if cart doesn't survive refresh, users lose their shopping session
2. **Cart quantity change recalculates subtotal** — users may pay wrong amount
3. **Checkout form submission** — entire purchase flow is untested end-to-end
4. **Compare: add product to table with specs** — entire feature has zero functional tests
5. **Wishlist: add-to-cart from wishlist** — conversion path from wishlist to cart is untested
