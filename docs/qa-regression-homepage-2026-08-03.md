# EnergyV1 Admin CMS — QA Regression Report

**Date:** 2026-08-03
**Target:** https://energyv1.vercel.app/admin
**Tester:** Automated QA (Playwright + Chrome headed)
**Scope:** Homepage CMS module — functional regression
**Methodology:** Black-box testing, production URL, real admin credentials

---

## EXECUTIVE SUMMARY

Homepage CMS passed 13 of 14 audited scenarios. Zero critical bugs found. Previously fixed bugs (duplicate sortOrder, moveDown swap logic) remain fixed — no regression.

**Caveat:** This audit covered structural integrity (page load, reorder, save, console errors, DB persistence). It did NOT cover section-specific settings editors (Hero image, Product Picker, Categories grid, CTA config, Testimonials config), image management (upload/replace/preview), or publish-to-public-end-to-end (change → publish → verify on homepage). These workflows remain to be verified before declaring full production readiness.

---

## TEST RESULTS: 14 audited, 13 PASS, 0 FAIL, 1 WARNING

| # | Test | Result | Detail |
|---|------|--------|--------|
| 1 | Page loads | ✅ PASS | 7 sections visible, no server errors |
| 2 | MoveUp first item disabled | ✅ PASS | First ▲ is `disabled` — correct boundary |
| 3 | MoveDown last item disabled | ✅ PASS | Last ▼ is `disabled` — correct boundary |
| 4 | MoveDown reorders | ✅ PASS | Middle ▼ click changes section order |
| 5 | Rapid clicks (5x) | ✅ PASS | No crash, no duplicate reorder |
| 6 | Section editor opens | ✅ PASS | Save Draft + Publish visible on click |
| 7 | Save Draft button | ✅ PASS | Visible + functional |
| 8 | Publish button | ✅ PASS | Visible (function not exercised) |
| 9 | Save Draft persists | ✅ PASS | Title change saved, survives nav-away |
| 10 | Unique sortOrder | ✅ PASS | 7 sequential values (0-6) |
| 11 | Console clean | ✅ PASS | 0 JavaScript errors |
| 12 | Public homepage renders | ✅ PASS | https://energyv1.vercel.app OK |
| 13 | DB sortOrder swap | ✅ PASS | Atomic UPDATE on both rows |
| 14 | Title field | ⚠️ WARN | Uses settings-based title (not `<input name=title>`) |

---

## NOT YET VERIFIED

These workflows require additional testing before full production readiness can be declared:

| Area | What's Missing | Risk |
|------|---------------|------|
| **Publish flow** | Change → Publish → Refresh → Verify public homepage | Medium |
| **Image management** | Upload, replace, delete, broken image, preview for hero | Medium |
| **Product Picker** | Search, autocomplete, select, clear, save, publish | High |
| **Cancel/undo** | Edit → Cancel → verify no save; Browser back → warning | Low |
| **Section-specific editors** | Hero (product link), Categories (layout), CTA (button), Testimonials (source), Projects (featured) | Medium |
| **Reorder + save persistence** | Move ↓ → Save → Refresh → order same (tested only in-memory, not save-then-refresh) | Low |
| **Network errors** | 500/4xx during save, failed fetch detection | Low |
| **Accessibility** | Tab order, ARIA labels, focus management | Low |
| **Responsive** | Mobile viewport (768px, 375px) | Low |

---

## PREVIOUSLY FIXED BUGS (VERIFIED)

| Bug | Root Cause | Fix | Status |
|-----|-----------|-----|--------|
| ▼ not working | Duplicate `sortOrder=6` on testimonials + brands | Normalized to 0-6 sequential | ✅ Fixed |
| Swap no-op with equal values | If both target and source have same sortOrder, swap does nothing | Added guard: increment target when equal before swap | ✅ Fixed |

---

## STATUS: PARTIAL PASS

Homepage CMS passed all structural/integrity checks. Section reorder, save draft, and DB persistence work correctly. Previously fixed bugs remain fixed.

**Not yet production-certified** for image-heavy workflows, Product Picker integration, and end-to-end publish-to-public verification.

Recommend next: Product Picker + image upload regression, then end-to-end publish test.

---

## REMAINING MODULES

| Priority | Module | Status |
|----------|--------|--------|
| 🔴 1 | Homepage CMS | ✅ Partial (14/14 audited, deeper tests pending) |
| 🔴 2 | Products | ⬜ Pending |
| 🔴 3 | Projects | ⬜ Pending |
| 🔴 4 | Media Library | ⬜ Pending |
| 🟠 5 | Testimonials | ⬜ Pending |
| 🟠 6 | Brands | ⬜ Pending |
| 🟠 7 | Categories | ⬜ Pending |
| 🟢 8 | Articles | ⬜ Pending |
| 🟢 9 | Navigation | ⬜ Pending |
| 🟢 10 | Settings/Appearance | ⬜ Pending |
