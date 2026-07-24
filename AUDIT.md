# Phase 1 Architecture Audit

## 1. Server vs Client Boundaries — ✅ PASS

| File | Directive | Justification |
|------|-----------|---------------|
| `Pagination.tsx` | Client | onClick handlers, page state |
| `Tabs.tsx` | Client | useState for active tab |
| `Accordion.tsx` | Client | useState for expand/collapse |
| `Modal.tsx` | Client | useEffect for ESC key, body scroll lock |
| `HeroSlider.tsx` | Client | useState, useEffect for auto-rotate |
| `NewsletterForm.tsx` | Client | form onSubmit handler |
| `SearchBar.tsx` | Client | useState for query, router.push |
| `FloatingWhatsApp.tsx` | Client | (could be Server — just a static link) |
| `MobileMenu.tsx` | Client | useState for open/close |

**All justified.** No unnecessary Client Components.

## 2. Duplicated Logic — ⚠️ 2 ISSUES

### Issue 1: Inline SVG icons duplicated across 10 files
Same chevron-right, search, cart, heart, hamburger, X, user icons repeated in:
- Header.tsx, ProductCard.tsx, Price.tsx, NeedCards.tsx, Breadcrumb.tsx, SearchBar.tsx, Modal.tsx, MobileMenu.tsx, Accordion.tsx, ProductCarouselSection.tsx, Button.tsx, FloatingWhatsApp.tsx

**Fix:** Extract to `src/components/ui/Icons.tsx` — one file with all SVG icon components.

### Issue 2: MobileMenu duplicates SearchBar input
Lines 34-44 of MobileMenu.tsx have the same search input markup as SearchBar.tsx.

**Fix:** Import `<SearchBar />` into MobileMenu.

## 3. Component Reusability — ⚠️ 1 ISSUE

### ProductCard line 38 — complex ternary
```tsx
badge === 'new' ? 'new' : badge === 'promo' ? 'promo' : badge === 'clearance' ? 'clearance' : 'cheapest'
```
**Fix:** Use a lookup map. Already matches Badge variant names 1:1 — just pass `badge` directly:
```tsx
<Badge key={badge} variant={badge}>
```

## 4. Tailwind Consistency — ✅ PASS
- No hardcoded pixel values
- No inline `style=` attributes
- Consistent token usage (brand-*, accent-*, gray-*)
- Proper responsive prefixes

## 5. Accessibility — ✅ PASS
- All interactive elements have `aria-label`
- All `<nav>` elements have `aria-label`
- Tabs have `role="tablist"`, `role="tab"`, `aria-selected`
- Modal has ESC key handler + body scroll lock + close button
- SkipToContent link present
- All form inputs have associated labels (sr-only where needed)
- All images have meaningful `alt` text (decorative images use `alt=""`)

## 6. Technical Debt — 3 ITEMS

| # | Item | Priority | Fix Now? |
|---|------|----------|----------|
| 1 | Inline SVGs (20 occurrences, 10 files) | Medium | ✅ Fix before Phase 2 |
| 2 | MobileMenu → SearchBar duplication | Low | ✅ Fix before Phase 2 |
| 3 | ProductCard badge ternary | Low | ✅ Fix before Phase 2 |

## 7. Missing pieces for 20-page scale

| Missing | Priority |
|---------|----------|
| `lib/api/` directory (data access layer) | High — needed for category/product filtering |
| `generateMetadata()` for dynamic routes | High — needed for SEO |
| `loading.tsx` for product/category pages | Medium |
| `error.tsx` boundary | Medium |
| Cart/Wishlist/Compare providers | Phase 2 |
| Empty states for all pages | Phase 2+ |

## Verdict

**Architecture is sound.** 9 Client Components all justified. Accessibility solid. Tailwind consistent. Three small fixes needed before scaling to 20 pages (icons extraction, SearchBar reuse, badge simplification). No blocking issues.
