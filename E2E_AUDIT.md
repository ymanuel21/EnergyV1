# Playwright E2E — Business Outcome Audit

## Audit Methodology

Each test is scored on:
- **Business objective**: What user goal does this test validate?
- **Assertion quality**: Does the assertion prove the business outcome?
- **False positive risk**: Could this test pass when the feature is actually broken?

---

## 1. SEARCH — `critical-path/search.spec.ts`

### Test 1: "search from header navigates to results"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User types "panel surya" → sees matching products on search page |
| **Current assertions** | URL contains `/cari?q=panel+surya`, text "Hasil pencarian" visible |
| **False positive risk** | 🔴 HIGH — "Hasil pencarian" renders even with 0 results. URL alone doesn't prove products were found. |
| **Verdict** | ❌ FAILS — Assertion proves navigation occurred but NOT that search returned results |

**Stronger assertion needed:**
```typescript
// Verify actual product cards rendered
const cards = page.locator('article');
await expect(cards.first()).toBeVisible();
const count = await cards.count();
expect(count).toBeGreaterThan(0);

// Verify matching product name in results
await expect(page.getByText('Panel Surya Mitsubishi')).toBeVisible();
```

### Test 2: "empty search shows guidance"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User lands on /cari with no query → prompted to enter search terms |
| **Current assertions** | Text "minimal 2 karakter" visible |
| **False positive risk** | 🟢 LOW — text is conditional on `q.length < 2` |
| **Verdict** | ✅ PASSES |

### Test 3: "no results shows empty state"

| Field | Assessment |
|-------|-----------|
| **Business objective** | Searching nonexistent product → helpful empty state, no product cards |
| **Current assertions** | Text "Tidak ada produk yang cocok" visible |
| **False positive risk** | 🟡 MEDIUM — text could render alongside stale product cards from previous navigation |
| **Verdict** | ⚠️ NEEDS HARDENING |

**Stronger assertion:**
```typescript
await expect(page.getByText('Tidak ada produk yang cocok')).toBeVisible();
// Also verify no product cards rendered
await expect(page.locator('article')).toHaveCount(0);
```

### Test 4: "sort works on search results"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User changes sort to price-desc → results reorder highest-to-lowest |
| **Current assertions** | URL contains `sort=price-desc` |
| **False positive risk** | 🔴 HIGH — URL parameter changes but doesn't verify products actually reordered. Client-side URL update without server re-render passes. |
| **Verdict** | ❌ FAILS — Proves URL changed, NOT that sort was applied |

**Stronger assertion:**
```typescript
// Capture first price before sort
const firstPriceBefore = await page.locator('article').first().locator('text=Rp').first().textContent();

// Change sort
await combo.selectOption('price-desc');
await page.waitForURL(/sort=price-desc/);

// Capture first price after sort — should be higher (descending)
const firstPriceAfter = await page.locator('article').first().locator('text=Rp').first().textContent();
const priceBefore = parseInt(firstPriceBefore!.replace(/\D/g, ''));
const priceAfter = parseInt(firstPriceAfter!.replace(/\D/g, ''));
expect(priceAfter).toBeGreaterThanOrEqual(priceBefore);
```

---

## 2. CART — `critical-path/cart.spec.ts`

### Test 1: "displays empty state initially"

| Field | Assessment |
|-------|-----------|
| **Business objective** | Empty cart → shows message + CTA to start shopping |
| **Current assertions** | "Keranjang kosong" + "Mulai Belanja" visible |
| **False positive risk** | 🟢 LOW |
| **Verdict** | ✅ PASSES |

### Test 2: "add to cart from product page"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User adds Mitsubishi panel to cart → cart shows the product with correct price and quantity |
| **Current assertions** | Heading contains "Keranjang Belanja" |
| **False positive risk** | 🔴 CRITICAL — "Keranjang Belanja" is the heading on BOTH empty AND filled cart. Test passes even if add-to-cart silently failed! |
| **Verdict** | ❌ FAILS — Does not prove product was added to cart |

**Stronger assertion:**
```typescript
await page.goto('/keranjang');

// Verify product name appears in cart
await expect(page.getByText('Mitsubishi')).toBeVisible();

// Verify subtotal is non-zero
const subtotal = page.getByText('Rp 1.450.000');
await expect(subtotal).toBeVisible();

// Verify item count
await expect(page.getByText('1 item')).toBeVisible();
```

---

## 3. RFQ — `critical-path/rfq.spec.ts`

### Test 1: "form renders all sections"

| Field | Assessment |
|-------|-----------|
| **Business objective** | RFQ page loads with all form sections |
| **Current assertions** | 3 section headers visible |
| **False positive risk** | 🟢 LOW — section headers are conditional |
| **Verdict** | ✅ PASSES (sanity check, acceptable) |

### Test 2: "validation shows errors for empty form"

| Field | Assessment |
|-------|-----------|
| **Business objective** | Submitting empty form → validation errors, form does NOT advance |
| **Current assertions** | Specific error messages: "Nama wajib diisi", "Email tidak valid", "Minimal 1 item" |
| **False positive risk** | 🟢 LOW — error text is conditional on validation failure |
| **Verdict** | ✅ PASSES |

### Test 3: "adding item works"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User types item name + clicks "Tambah" → item appears in list with correct name |
| **Current assertions** | Text "Panel Surya 540Wp" visible |
| **False positive risk** | 🟢 LOW |
| **Verdict** | ✅ PASSES |

### Test 4: "valid form proceeds to confirmation"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User fills valid form → confirmation screen with WhatsApp integration |
| **Current assertions** | "Permintaan Terkirim!" + "Test User" visible |
| **False positive risk** | 🟡 MEDIUM — doesn't verify WhatsApp button exists, doesn't verify the message content includes RFQ items |
| **Verdict** | ⚠️ NEEDS HARDENING |

**Stronger assertion:**
```typescript
await expect(page.getByText('Permintaan Terkirim!')).toBeVisible();
await expect(page.getByText('Test User')).toBeVisible();

// Verify WhatsApp button exists with correct target
const waButton = page.getByRole('link', { name: /Kirim via WhatsApp/ });
await expect(waButton).toBeVisible();
const href = await waButton.getAttribute('href');
expect(href).toContain('wa.me');
expect(href).toContain('Panel+Surya'); // Item should be in message

// Verify summary shows item count
await expect(page.getByText('1 item')).toBeVisible();
```

---

## 4. CHECKOUT — `critical-path/checkout.spec.ts`

### Test 1: "shows empty cart state when no items"

| Field | Assessment |
|-------|-----------|
| **Business objective** | Checkout without cart items → empty state + redirect CTA |
| **Current assertions** | "Keranjang kosong" visible |
| **False positive risk** | 🟢 LOW |
| **Verdict** | ✅ PASSES |

### Test 2: "checkout requires items in cart"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User with cart items → sees shipping form with order summary |
| **Current assertions** | "Informasi Pengiriman" visible |
| **False positive risk** | 🟡 MEDIUM — doesn't verify order summary sidebar shows added product |
| **Verdict** | ⚠️ NEEDS HARDENING |

**Stronger assertion:**
```typescript
await expect(page.getByText('Informasi Pengiriman')).toBeVisible();

// Verify order summary shows the added product
await expect(page.getByText('Mitsubishi')).toBeVisible();

// Verify subtotal is correct
await expect(page.getByText('Rp 1.450.000')).toBeVisible();
```

### Test 3: "checkout step navigation works"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User advances through shipping → payment → review steps |
| **Current assertions** | Step labels visible + "Lanjutkan →" button visible |
| **False positive risk** | 🔴 HIGH — only verifies step labels render. Doesn't verify clicking "Lanjutkan" actually advances to step 2. Doesn't verify step 1 is visually active. |
| **Verdict** | ❌ FAILS — Proves labels exist, NOT that navigation works |

**Stronger assertion:**
```typescript
// Step 1 should be active (colored circle)
const step1 = page.locator('span:has-text("1")').first();
await expect(step1).toHaveClass(/bg-brand-600/);

// Click "Lanjutkan" to go to payment step
await page.getByRole('button', { name: /Lanjutkan/ }).click();

// Step 2 should now show payment methods
await expect(page.getByText('Metode Pembayaran')).toBeVisible();
await expect(page.getByText('Transfer Bank')).toBeVisible();

// Step 2 circle should be active
await expect(page.locator('span:has-text("2")').first()).toHaveClass(/bg-brand-600/);

// Advance to review
await page.getByRole('button', { name: /Review Pesanan/ }).click();
await expect(page.getByText('Review Pesanan')).toBeVisible();
```

---

## 5. WISHLIST — `critical-path/wishlist.spec.ts`

### Test 1: "displays empty state initially"

| Field | Assessment |
|-------|-----------|
| **Business objective** | Fresh wishlist → empty state |
| **Current assertions** | "Wishlist kosong" visible |
| **False positive risk** | 🟢 LOW |
| **Verdict** | ✅ PASSES |

### Test 2: "displays saved products after adding from product page"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User clicks wishlist button → product appears on wishlist page |
| **Current assertions** | Heading contains "Wishlist" |
| **False positive risk** | 🔴 CRITICAL — Test admits wishlist button is NOT connected to provider. Uses `if (await wishlistBtn.isVisible())` conditional that silently skips the click. Final assertion only checks heading text. |
| **Verdict** | ❌ FAILS — Self-admitted broken test. Does not validate any business outcome. |

**Root cause**: Wishlist button on product detail page (`♡ Wishlist`) is a plain `<Button>` without `onClick` wiring to `WishlistProvider`. The button renders but does nothing.

**Fix**: Wire the wishlist button to `useWishlist().toggleItem(product.id)`, then test:
```typescript
// Click wishlist button on product page
await page.getByRole('button', { name: /Wishlist/ }).click();

// Navigate to wishlist
await page.goto('/wishlist');

// Product should appear
await expect(page.getByText('Mitsubishi')).toBeVisible();
await expect(page.getByText('Rp 1.450.000')).toBeVisible();
```

---

## 6. COMPARE — `regression/compare.spec.ts`

### Test 1: "displays empty state initially"

| Field | Assessment |
|-------|-----------|
| **Business objective** | Empty compare → helpful message |
| **Current assertions** | "Belum ada produk yang dibandingkan" visible |
| **False positive risk** | 🟢 LOW |
| **Verdict** | ✅ PASSES |

### Test 2: "has call-to-action link to products"

| Field | Assessment |
|-------|-----------|
| **Business objective** | User can navigate from compare to products |
| **Current assertions** | "Lihat Produk" text visible |
| **False positive risk** | 🟡 MEDIUM — text is visible but doesn't verify the link navigates to /produk |
| **Verdict** | ⚠️ NEEDS HARDENING |

**Stronger assertion:**
```typescript
await page.getByText('Lihat Produk').click();
await expect(page).toHaveURL('/produk');
```

---

## Summary

| Page | Tests | Pass | Fail | Critical Issue |
|------|-------|------|------|----------------|
| Search | 4 | 1 | 2 | Sort test doesn't verify reordering; results test doesn't verify products appeared |
| Cart | 2 | 1 | 1 | Add-to-cart test passes even when cart is empty |
| RFQ | 4 | 3 | 0 | Confirmation doesn't verify WhatsApp integration |
| Checkout | 3 | 1 | 1 | Navigation test only checks labels, not actual step advancement |
| Wishlist | 2 | 1 | 1 | Button not connected to provider — test admits this |
| Compare | 2 | 1 | 0 | CTA click not verified |
| **Total** | **17** | **8** | **5** | **4 tests need rewrite** |

### By severity

| Tests | Issue |
|-------|-------|
| 🔴 Cart "add to cart" | Passes on empty cart — heading text identical for both states |
| 🔴 Wishlist "saved products" | Button not wired to provider — test author admitted this |
| 🔴 Search "sort" | URL change doesn't prove data reordered |
| 🔴 Checkout "navigation" | Labels visible ≠ steps advance |

### Recommended actions

1. **Cart test**: Verify product name + subtotal, not just heading text
2. **Wishlist button**: Wire the `♡ Wishlist` button on product detail to `WishlistProvider.toggleItem()`
3. **Search sort test**: Capture prices before/after sort, verify descending order
4. **Checkout navigation test**: Click through steps, verify step content changes
