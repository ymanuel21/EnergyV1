# Production Engineering Review — EBTPlaza

**Reviewer**: Lead Architect / Senior Staff Engineer  
**Date**: 2026-07-24  
**Codebase**: 98 TS/TSX files, ~6,500 LOC, Next.js 16 App Router

---

## Phase 1: Architecture Audit

### Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Architecture** | 78/100 | Clean separation, API layer exists but not fully adopted |
| **Maintainability** | 72/100 | Good patterns but 9 files bypass API layer; 2 empty dirs; 2 unused components |
| **Technical Debt** | 65/100 | Missing API coverage for 5 content types; static data in 7 files |

### Folder Structure Review

```
src/
├── app/                    ✅ Clean — 1 route per folder, no nesting beyond [slug]
├── components/
│   ├── ui/                 ✅ 18 primitives, 2 unused (Divider, VisuallyHidden)
│   ├── layout/             ✅ 8 layout components
│   ├── product/            ✅ 9 product components
│   ├── home/               ✅ 3 homepage sections
│   ├── forms/              ✅ 2 form components
│   ├── category/           ✅ 1 component — correct
│   ├── cart/               ❌ EMPTY DIRECTORY — 0 files
│   └── checkout/           ❌ EMPTY DIRECTORY — 0 files
├── lib/
│   ├── api/                ✅ Clean abstraction layer
│   ├── data/               ⚠️ 7 static data files — no migration path yet
│   └── utils/              ✅ 4 utility files
├── providers/              ✅ 4 providers, all small (<140 lines)
├── hooks/                  ✅ 1 hook
└── types/                  ✅ 6 type files, barrel export
```

### Separation of Concerns

| Layer | Responsibility | Grade |
|-------|---------------|-------|
| `app/` | Routes + page-level logic | ✅ Clean |
| `components/` | Reusable UI | ✅ Good |
| `lib/api/` | Data access abstraction | ⚠️ Incomplete — only products and brands have API coverage |
| `lib/data/` | Static data store | ⚠️ Direct imports from 9 files — bypasses API layer |
| `providers/` | Client-side state | ✅ Clean, no external libs |
| `types/` | TypeScript types | ✅ Barrel export, well-organized |

### API Layer Coverage Gap

| Content Type | API Exists? | Files Directly Importing Data |
|-------------|------------|------------------------------|
| Products | ✅ Partial | 6 files bypass API (homepage, product detail, brand listing, wishlist, compare, brand detail) |
| Categories | ❌ No API | 2 files (category page, product page breadcrumb) |
| Brands | ✅ Full | 0 bypasses |
| Articles | ❌ No API | 2 files (listing + detail) |
| Static Pages | ❌ No API | 1 file |
| Banners/Need Cards | ❌ No API | 1 file (homepage) |
| FAQ | ❌ Hardcoded in component | 1 file (FAQ page) |

**Impact**: When data moves to a database, 12 files need changes instead of 4 API files.

### Duplicated Logic

| Pattern | Occurrences | Recommendation |
|---------|------------|----------------|
| `encodeURIComponent` for WhatsApp URLs | 3 locations (affiliate ×2, RFQ) | Acceptable — each has different message context |
| `formatCurrency` in cart/checkout | 8 occurrences across 2 files | Acceptable — display logic, not business logic |
| Product grid CSS classes | 5 listing pages | Acceptable — each page has different layout (2-col, 3-col, 4-col) |

**Verdict**: **No meaningful duplication.** Each repeated pattern serves slightly different contexts.

### Naming Consistency

| Pattern | Convention | Consistency |
|---------|-----------|-------------|
| Props interfaces | `{ComponentName}Props` | ✅ Consistent across all 18 UI primitives |
| File names | PascalCase for components, kebab-case for utilities | ✅ Consistent |
| Function names | camelCase | ✅ Consistent |
| Route folders | kebab-case Indonesian (`barang-clearance`, `permintaan-penawaran`) | ✅ Consistent |
| Export style | Named exports everywhere | ✅ Consistent |

### Dead Code

| Item | Location | Action |
|------|----------|--------|
| `Divider` component | `components/ui/Divider.tsx` | Never imported — remove |
| `VisuallyHidden` component | `components/ui/VisuallyHidden.tsx` | Never imported — remove |
| `components/cart/` | Empty directory | Remove |
| `components/checkout/` | Empty directory | Remove |
| `components/forms/NewsletterForm.tsx` | Has TODO comment, no actual submission | Keep (functional, just no backend) |

### Client Component Audit

| Total | In `components/` | In `app/` | In `providers/` |
|-------|-----------------|-----------|----------------|
| 25 | 18 | 3 (checkout, keranjang, perbandingan) | 4 |

All 25 `'use client'` directives are justified — each component requires interactivity (state, effects, event handlers, browser APIs). None are unnecessary.

---

## Phase 2: Refactoring (Safe Changes Only)

### Applied Refactors

| # | Change | Reason | Files |
|---|--------|--------|-------|
| 1 | Remove empty `components/cart/` directory | Dead directory, 0 files | 1 |
| 2 | Remove empty `components/checkout/` directory | Dead directory, 0 files | 1 |
| 3 | Remove unused `Divider` component | Never imported anywhere | 1 |
| 4 | Remove unused `VisuallyHidden` component | Never imported anywhere | 1 |

### Changes NOT Made (and Why)

| Candidate | Why Left Alone |
|-----------|---------------|
| NewsletterForm has TODO | It's functional (validates email, renders form) — just has no backend. Removing it would break the footer. |
| ProductBadge used in 1 file | Single-use component is correct — it wraps Badge with product-specific variant logic |
| 5 listing pages share grid classes | Each page uses a different column count (2–4 columns). Extracting would reduce clarity. |
| encodeURIComponent repeated | Each usage builds a completely different message string. Extracting into a helper would be wrong abstraction. |

---

## Phase 3: Developer Experience

The README.md has already been updated with:

- Project overview, technology stack, architecture diagram
- Complete route map table (19 routes with rendering strategy)
- Component documentation (40+ components)
- Provider specs (Cart, Wishlist, Compare, Toast)
- API layer documentation
- SEO infrastructure
- Testing guide
- Maintenance guide (how to add products, categories, brands, articles)
- Deployment instructions
- Troubleshooting section
- Future improvements

No additional documentation needed.

---

## Phase 4: Code Documentation

### Comments Added

| File | Comment | Why |
|------|---------|-----|
| `lib/api/products.ts` | "Future: when products move to JSON/CMS, only this file changes" | Already present — migration seam marker |
| `lib/api/filters.ts` | Function-level JSDoc for each export | Needed — these functions form the shared pipeline used by 5 pages |

No other comments needed. The code is self-documenting through clear naming.

---

## Phase 5: Future Roadmap

See `ROADMAP.md`.

### Current Limitations

1. **Static data only** — 7 TypeScript files hold all content. Editing requires code changes + redeploy.
2. **No content management** — No admin UI. Non-technical users cannot update prices, add products, or edit articles.
3. **No analytics** — No GA4, no conversion tracking, no page view metrics.
4. **No error tracking** — Client-side errors are silently lost. No Sentry/Vercel Observability.
5. **No CSP header** — Security policy not enforced at the browser level.
6. **Mobile viewport tests** — 0 of 28 tests run on mobile viewports.
7. **Untested routes** — Promo, clearance, affiliate, static pages have no E2E tests.

### Recommended Next Features (Priority Order)

| Priority | Feature | Effort | Impact |
|----------|---------|--------|--------|
| P1 | Complete API layer (5 missing wrappers) | 2h | Enables database migration |
| P1 | CSP header | 15 min | Security |
| P1 | GA4 analytics | 15 min | Business metrics |
| P2 | Error tracking (Sentry) | 30 min | Production reliability |
| P2 | Mobile E2E tests | 1h | Test coverage |
| P2 | Product images (replace placeholders) | Content | Visual quality |
| P3 | Admin panel | 24h | Content management |
| P3 | Database migration | 24h | Scalability |
| P3 | CMS integration | 16h | Non-technical editing |

### Database Migration Path

Already documented in `MIGRATION_PLAN.md`. Summary:
- **Phase 0** (today): Complete API layer — create wrappers for articles, categories, pages, banners, FAQ, settings
- **Phase 1**: Authentication (NextAuth.js)
- **Phase 2**: Database (Neon + Prisma)
- **Phase 3-5**: Content-type CRUD
- **Phase 6-7**: Dashboard + Polish

Estimated: 24 hours total. Zero component changes if API layer is completed first.

---

## Phase 6: Final Report

### PROJECT_HEALTH.md

**Overall Score: 76/100**

| Dimension | Score | Key Factor |
|-----------|-------|-----------|
| Architecture | 78/100 | Clean separation, API layer 60% complete |
| Performance | 82/100 | SSG + ISR, WebP, CDN cache, 0 runtime deps |
| SEO | 85/100 | Sitemap, robots, canonical, JSON-LD, OG, metadataBase |
| Accessibility | 70/100 | ARIA labels, keyboard nav, skip link. No mobile testing. |
| Testing | 78/100 | 28 E2E tests, 0 false positives. 6 routes untested. |
| Maintainability | 72/100 | Good patterns. API gap is the main issue. |
| Developer Experience | 80/100 | Clear structure, good README, consistent conventions. |
| Security | 75/100 | Form validation, URL validation. No CSP, no error tracking. |
| Production Readiness | 74/100 | Build passes. Missing: CSP, analytics, error tracking, real images. |

### Technical Debt Summary

| Debt | Severity | Cost to Fix |
|------|----------|------------|
| Incomplete API layer (5 content types missing) | Medium | 2 hours |
| 9 files bypass API layer | Medium | 1 hour |
| No analytics | Low | 15 minutes |
| No error tracking | Low | 30 minutes |
| No CSP | Low | 15 minutes |
| Placeholder product images | Content | Days |
| No mobile E2E tests | Low | 1 hour |

### Production Readiness

**Status: Ready with conditions.**

| Check | Status |
|-------|--------|
| Build passes | ✅ |
| E2E tests pass | ✅ 28/28 |
| SEO infrastructure | ✅ |
| Image optimization | ✅ |
| Form validation | ✅ |
| CSP header | ❌ |
| Error tracking | ❌ |
| Analytics | ❌ |
| Product images | ⚠️ Placeholders |

### Final Recommendations

1. **Complete the API layer now** — create the 5 missing wrapper functions. Cost: 2 hours. Benefit: makes database/CMS migration a drop-in replacement with zero component changes.

2. **Add CSP + analytics + error tracking** before production launch. Cost: 1 hour total. Benefit: security compliance, business metrics, production reliability.

3. **Do NOT add a database yet** — 8 products and 4 articles don't justify the infrastructure complexity. Wait until a non-technical person needs to edit content or the product count exceeds 50.

4. **Replace placeholder images** as a content task — no code changes needed. Just drop real images into `public/images/products/` and update `products.ts`.
