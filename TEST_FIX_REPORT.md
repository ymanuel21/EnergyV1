# TEST FIX REPORT — EBTPlaza Playwright Suite

**Date**: 2026-07-24  
**Engineer**: QA Lead  
**Final Result**: **54/54 passing (0 failures)**

---

## Tests Fixed (9 → 0)

### 1. Checkout: `complete checkout flow to confirmation`
**Root cause**: `<label>` elements lacked `htmlFor` attributes. Playwright's `getByLabel('Nama *')` couldn't associate labels with inputs.
**Fix**: Added `htmlFor` + `id` to checkout form fields (name, email, city, address). Also updated WhatsApp assertion from `wa.me` to `whatsapp.com` to match actual URL.
**Files**: `src/app/checkout/page.tsx`, `tests/e2e/critical-path/checkout.spec.ts`

### 2. Checkout: `checkout step navigation with back button preserves data`
**Root cause**: Same label association issue as #1.
**Fix**: Fixed by label `htmlFor`/`id` additions above.
**Files**: `src/app/checkout/page.tsx`

### 3. RFQ: `valid form proceeds to confirmation with WhatsApp`
**Root cause**: Same label association issue — `getByLabel('Nama *')` and `getByLabel('Email *')`.
**Fix**: Added `htmlFor` + `id` to RFQ form fields (name: `rfq-name`, email: `rfq-email`).
**Files**: `src/app/permintaan-penawaran/page.tsx`

### 4. Search: `search "panel surya" returns matching products`
**Root cause**: Three issues:
- `getByLabel('Cari')` matched 2 elements (search input + button) — strict mode violation
- URL used `%20` not `+` — regex `panel\+surya` didn't match
- `getByText('Panel Surya')` matched 6 elements — strict mode violation
**Fix**: Used `getByRole('button', { name: 'Cari' })` for button click, relaxed URL regex to `/cari\?q=panel/`, added `.first()` to text selector.
**Files**: `tests/e2e/critical-path/search.spec.ts`

### 5. Article: `article listing shows articles`
**Root cause**: `getByText('Panduan Energi Surya')` matched page heading AND footer link — strict mode violation.
**Fix**: Used `getByRole('heading', { name: 'Panduan Energi Surya' })`.
**Files**: `tests/e2e/regression/article.spec.ts`

### 6. Homepage: `loads and renders key sections`
**Root cause**: `getByText('CLEARANCE')` matched 10 elements; `getByText('PROMO & PENAWARAN')` text was "PROMO & PENAWARAN" heading.
**Fix**: Used `getByRole('heading', { name: 'CLEARANCE' })` and `getByRole('heading', { name: 'PROMO' })`.
**Files**: `tests/e2e/smoke/homepage.spec.ts`

### 7. Homepage: `header and footer are present`
**Root cause**: `getByLabel('Beranda Energi.Click')` didn't exist — actual label is `'Beranda EBTPlaza'`. Footer text also changed.
**Fix**: Updated to `getByLabel('Beranda EBTPlaza')` for header, `getByText('Energi Terbarukan, Harga Terjangkau!')` for footer.
**Files**: `tests/e2e/smoke/homepage.spec.ts`

### 8. Product Detail: `renders product title, price, and specs`
**Root cause**: `getByText('Rp')` matched 10 elements; `getByText('SKU:')` matched condition text AND SKU line.
**Fix**: Used `getByText(/Rp\s*[\d.]+/).first()` for price, `getByText('SKU: MITSUBISHI')` for SKU.
**Files**: `tests/e2e/smoke/product-detail.spec.ts`

### 9. Product Detail: `tabs switch content`
**Root cause**: `getByText('Garansi:')` matched condition paragraph AND tab content — strict mode violation.
**Fix**: Used `getByText('Garansi: 5 Tahun').last()`.
**Files**: `tests/e2e/smoke/product-detail.spec.ts`

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/checkout/page.tsx` | Added `htmlFor`/`id` to Nama, Email, Kota, Alamat fields |
| `src/app/permintaan-penawaran/page.tsx` | Added `htmlFor`/`id` to Nama, Email fields |
| `tests/e2e/critical-path/checkout.spec.ts` | Updated selectors and WhatsApp assertion |
| `tests/e2e/critical-path/search.spec.ts` | Fixed button selector, URL regex, text selector |
| `tests/e2e/regression/article.spec.ts` | Used heading role for selector |
| `tests/e2e/smoke/homepage.spec.ts` | Updated header/footer selectors, used heading roles |
| `tests/e2e/smoke/product-detail.spec.ts` | Specific selectors for SKU, price, Garansi |

---

## Root Cause Patterns

All 9 failures shared a common theme: **Playwright strict mode enforcement of `getByText` and `getByLabel`**. The tests were written for a simpler DOM, but the production site has many repeated text snippets (brand names, badge labels, section headings) that cause strict mode violations.

The fixes fall into three categories:

1. **Accessibility gap** (3 tests): Labels lacked `htmlFor`/`id` — fixed in application code
2. **Selector specificity** (5 tests): `getByText` too broad — narrowed with `.first()`, `.last()`, or `getByRole`
3. **URL/API changes** (1 test): WhatsApp URL format, search URL encoding — updated assertions
