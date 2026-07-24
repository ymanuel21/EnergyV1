# EnergyV1 — Production Launch Checklist

> Do not deploy until all ☐ items are checked.

---

## 1. DEPLOYMENT

### 1.1 Vercel Configuration

| ☐ | Task | Detail |
|---|------|--------|
| ☐ | Connect GitHub repo | Import `EnergyV1` repo to Vercel dashboard |
| ☐ | Framework preset | Next.js (auto-detected) |
| ☐ | Build command | `npm run build` (default) |
| ☐ | Output directory | `.next` (default) |
| ☐ | Node version | Set to `22.x` in Vercel project settings |
| ☐ | Root directory | `/` (not a monorepo subdirectory) |

### 1.2 Environment Variables

| ☐ | Variable | Value | Scope |
|---|----------|-------|-------|
| ☐ | `NEXT_PUBLIC_SITE_URL` | `https://energi.click` | Production |
| ☐ | `NEXT_PUBLIC_WHATSAPP_NUMBER` | Real phone number (e.g., `6281234567890`) | Production |
| ☐ | `NEXT_PUBLIC_SITE_NAME` | `Energi.Click` | Production |
| ☐ | `NEXT_PUBLIC_SITE_DESCRIPTION` | `Pusat produk energi terbarukan...` | Production |

**Verification**: After deploy, visit `/api/env-check` or inspect page source for correct `<meta>` tags and `metadataBase`.

### 1.3 Build Verification

| ☐ | Check | Command / URL |
|---|-------|--------------|
| ☐ | Build passes locally | `npm run build` — must be 0 errors |
| ☐ | Vercel build passes | Check Vercel deployment logs for green ✅ |
| ☐ | All 54+ pages generated | Build output shows all static/dynamic routes |
| ☐ | No console errors on homepage | Open DevTools → Console on production URL |
| ☐ | No hydration errors | Check for "Hydration failed" in console |
| ☐ | All images resolve | Check Network tab — no 404s for images |
| ☐ | sitemap.xml accessible | Visit `/sitemap.xml` — must return XML with URLs |
| ☐ | robots.txt accessible | Visit `/robots.txt` — must return `Allow: /` |

---

## 2. SEO

### 2.1 Google Search Console

| ☐ | Task | Detail |
|---|------|--------|
| ☐ | Add property | Add `https://energi.click` as a URL-prefix property |
| ☐ | Verify ownership | Use DNS TXT record or HTML file upload |
| ☐ | Submit sitemap | Add `https://energi.click/sitemap.xml` in Sitemaps section |
| ☐ | Check indexing | Wait 24-48h, verify pages appear in "Pages" report |

### 2.2 Robots Verification

| ☐ | Check | Expected |
|---|-------|----------|
| ☐ | `robots.txt` returns 200 | `curl -sI https://energi.click/robots.txt` |
| ☐ | `Allow: /` present | Homepage, products, categories, articles allowed |
| ☐ | Checkout/wishlist/cart blocked | `Disallow: /checkout`, `/keranjang`, `/wishlist`, `/perbandingan` |
| ☐ | Sitemap URL in robots.txt | Contains `Sitemap: https://energi.click/sitemap.xml` |

### 2.3 Index Coverage Audit

| ☐ | Page type | Check in Search Console "Pages" report |
|---|-----------|--------------------------------------|
| ☐ | Homepage | Indexed, no errors |
| ☐ | Product pages (8) | All indexed with Product schema |
| ☐ | Category pages (9) | Indexed with canonical URLs |
| ☐ | Brand pages (10) | Indexed, no duplicate content warnings |
| ☐ | Article pages (4) | Indexed with Article schema |
| ☐ | Static pages (5) | Indexed (low priority, expect slower crawl) |
| ☐ | FAQ page | Indexed with FAQPage schema |
| ☐ | Affiliate page | Indexed |

### 2.4 Structured Data Validation

| ☐ | Test | Tool |
|---|------|------|
| ☐ | Product schema valid | [Rich Results Test](https://search.google.com/test/rich-results) on `/produk/*` |
| ☐ | Organization schema valid | Rich Results Test on `/` |
| ☐ | No schema errors | Check all pages with schema in GSC "Enhancements" |
| ☐ | BreadcrumbList schema valid | Test on any category/product page |

---

## 3. ANALYTICS

### 3.1 Google Analytics 4 Setup

| ☐ | Task | Detail |
|---|------|--------|
| ☐ | Create GA4 property | Property name: "Energi.Click" |
| ☐ | Get Measurement ID | Format: `G-XXXXXXXXXX` |
| ☐ | Add Google Analytics script | Install `@next/third-parties/google` or add `<Script>` to root layout |
| ☐ | Verify data flowing | Check Real-time report after visiting production site |

### 3.2 Conversion Events

| ☐ | Event | Trigger | Data Attributes |
|---|-------|---------|-----------------|
| ☐ | `add_to_cart` | "Tambah ke Keranjang" button click | `data-track="add-to-cart"`, product ID, name, price |
| ☐ | `begin_checkout` | User lands on `/checkout` | Cart value, item count |
| ☐ | `purchase` | Checkout form submitted | Transaction ID, value, items |
| ☐ | `view_item` | Product detail page load | Product ID, name, price |
| ☐ | `view_item_list` | Category/search page load | Category name, result count |
| ☐ | `search` | User submits search | Search query string |
| ☐ | `add_to_wishlist` | Wishlist toggle clicked | Product ID |
| ☐ | `add_to_compare` | Compare toggle clicked | Product ID |

### 3.3 RFQ Tracking

| ☐ | Event | Trigger | Notes |
|---|-------|---------|-------|
| ☐ | `rfq_form_start` | User lands on `/permintaan-penawaran` | Count form starts |
| ☐ | `rfq_form_submit` | "Kirim Permintaan" clicked | Capture item count, project type |
| ☐ | `rfq_whatsapp_click` | "Kirim via WhatsApp" clicked | Track conversion completion |
| ☐ | `rfq_import_cart` | "Import dari keranjang" clicked | Track cart-to-RFQ flow |

### 3.4 WhatsApp Click Tracking

| ☐ | Element | Event Name | Location |
|---|---------|-----------|----------|
| ☐ | Floating WhatsApp button | `whatsapp_float_click` | All pages |
| ☐ | RFQ confirmation WhatsApp | `whatsapp_rfq_click` | `/permintaan-penawaran` confirmation |
| ☐ | Affiliate CTA WhatsApp | `whatsapp_affiliate_click` | `/afiliasi` |
| ☐ | FAQ CTA WhatsApp | `whatsapp_faq_click` | `/faq` |
| ☐ | Product page WhatsApp | `whatsapp_product_click` | `/produk/*` |

---

## 4. MONITORING

### 4.1 Error Monitoring

| ☐ | Task | Detail |
|---|------|--------|
| ☐ | Set up Vercel Analytics | Enable in Vercel dashboard → Analytics tab |
| ☐ | Set up error tracking | Vercel Observability or add Sentry (`@sentry/nextjs`) |
| ☐ | Configure alert thresholds | 5+ errors in 1h → email alert |
| ☐ | Check for client-side errors | Monitor Vercel Web Vitals for JS errors |

### 4.2 Uptime Monitoring

| ☐ | Task | Detail |
|---|------|--------|
| ☐ | Add uptime monitor | [Upptime](https://upptime.js.org) (free, GitHub-based) or UptimeRobot |
| ☐ | Monitor homepage | `GET https://energi.click/` every 5 minutes |
| ☐ | Monitor API health | `GET https://energi.click/sitemap.xml` (proves SSR working) |
| ☐ | Alert on downtime | Email/Slack if down > 2 minutes |

### 4.3 Performance Monitoring

| ☐ | Metric | Target | Tool |
|---|--------|--------|------|
| ☐ | LCP (Largest Contentful Paint) | < 2.5s | Vercel Analytics / PageSpeed Insights |
| ☐ | CLS (Cumulative Layout Shift) | < 0.1 | Vercel Analytics |
| ☐ | FID (First Input Delay) | < 100ms | Vercel Analytics |
| ☐ | TTFB (Time to First Byte) | < 800ms | Vercel Analytics |
| ☐ | Lighthouse score | > 90 Performance, > 95 SEO | [PageSpeed Insights](https://pagespeed.web.dev/) |
| ☐ | Sitemap generation time | < 500ms | Vercel build logs |

---

## 5. CONTENT REVIEW

### 5.1 Product Data

| ☐ | Check | Detail |
|---|-------|--------|
| ☐ | All 8 products have real images | Replace `product-placeholder.png` with actual product photos |
| ☐ | Prices are current | Verify against latest price list |
| ☐ | Stock counts are accurate | Update `stock` field in `products.ts` |
| ☐ | Specifications are complete | All relevant specs filled for each product |
| ☐ | SKU numbers are correct | Match warehouse/ERP system |
| ☐ | Product descriptions are proofread | No typos, consistent tone, Indonesian language |

### 5.2 Images

| ☐ | Task | Detail |
|---|------|--------|
| ☐ | Hero banners uploaded | 2 banner images at 1280×427px |
| ☐ | All product images uploaded | 8 products × 1-3 images each |
| ☐ | Brand logos available | At minimum: brand initial avatars (already done) |
| ☐ | Need card icons created | "Beli Produk", "Pasang PLTS", "Kebutuhan Proyek" icons |
| ☐ | Image alt text is descriptive | "Panel Surya Mitsubishi 275 Wp — tampak depan" not "image1" |

### 5.3 Content Audit

| ☐ | Page | Check |
|---|------|-------|
| ☐ | Tentang Kami | Company info accurate, address correct |
| ☐ | Kebijakan Pengiriman | Shipping zones, timelines, costs accurate |
| ☐ | Kebijakan Retur | Return window, conditions, process accurate |
| ☐ | Syarat & Ketentuan | Legal review recommended |
| ☐ | Kebijakan Privasi | GDPR/PDP compliance reviewed |
| ☐ | FAQ | All 8 answers factually correct |
| ☐ | Artikel (4 pages) | Technical accuracy reviewed, no broken links |
| ☐ | Afiliasi | Commission rates correct |

---

## 6. SECURITY REVIEW

### 6.1 Dependency Audit

| ☐ | Command | Action |
|---|---------|--------|
| ☐ | `npm audit` | Review vulnerabilities, fix critical/high |
| ☐ | `npm outdated` | Update packages with breaking-change review |
| ☐ | Dependencies count | < 15 runtime deps (target: keep it small) |

### 6.2 Form Validation

| ☐ | Form | Check |
|---|------|-------|
| ☐ | RFQ | JS validation prevents empty submission ✅, email format validated ✅ |
| ☐ | Checkout | JS validation on shipping step ✅, email validated ✅ |
| ☐ | Newsletter | Email format validation ✅, no XSS in input |
| ☐ | Search | Input sanitized (encodeURIComponent) ✅, no XSS |
| ☐ | Product Q&A | Not yet implemented — medium risk |

### 6.3 XSS / Injection Review

| ☐ | Vector | Status |
|---|--------|--------|
| ☐ | URL parameters reflected in DOM | All listing pages use validated params ✅ |
| ☐ | `dangerouslySetInnerHTML` usage | Only on JSON-LD structured data from trusted source ✅ |
| ☐ | User-generated content | None accepted yet (reviews, Q&A pending) |

### 6.4 CSP (Content Security Policy)

| ☐ | Task | Detail |
|---|------|--------|
| ☐ | Add CSP header | `Content-Security-Policy` in `next.config.ts` headers |
| ☐ | Recommended directives | `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; connect-src 'self' https://www.google-analytics.com` |

---

## 7. FINAL QA

### 7.1 Smoke Checklist

| ☐ | Test | Expected |
|---|------|----------|
| ☐ | Homepage loads | Hero, need cards, clearance, promo, header, footer visible |
| ☐ | Product detail | Title, price, gallery, tabs, add-to-cart, wishlist, compare |
| ☐ | Category listing | Products render, sort works, breadcrumb correct |
| ☐ | Search | "panel surya" returns results, empty query shows guidance |
| ☐ | Brand pages | Directory lists all brands, brand detail shows products |
| ☐ | Cart | Add → cart shows item, qty change updates subtotal, remove works |
| ☐ | Checkout | Steps advance, validation works, submission successful |
| ☐ | Wishlist | Toggle adds/removes, persists across pages |
| ☐ | Compare | Max 4 enforcement, table shows specs |
| ☐ | RFQ | Validation works, import from cart, WhatsApp link correct |
| ☐ | FAQ | Accordions expand/collapse, CTAs link correctly |
| ☐ | Affiliate | Page renders, WhatsApp CTA links |
| ☐ | Static pages | All 5 pages render, breadcrumbs correct |
| ☐ | Newsletter | Email validation works |

### 7.2 Mobile Checklist (iPhone SE / Pixel 5 viewport)

| ☐ | Test | Expected |
|---|------|----------|
| ☐ | Homepage | No horizontal overflow, sections stack vertically |
| ☐ | Header hamburger | Opens menu, categories grid visible, search works |
| ☐ | Product page | Single column, gallery touch-friendly, buttons full-width |
| ☐ | Category page | 2-column grid, filters accessible |
| ☐ | Cart | Touch-friendly quantity buttons, checkout button prominent |
| ☐ | Checkout | Form inputs keyboard-friendly, no zoom on input focus (iOS) |
| ☐ | RFQ | Form sections scrollable, "Tambah" button accessible |
| ☐ | Compare | Table scrolls horizontally (acceptable) |
| ☐ | FAQ | Accordions tappable, contact buttons visible |

### 7.3 Browser Checklist

| ☐ | Browser | Version |
|---|---------|---------|
| ☐ | Chrome | Latest (120+) |
| ☐ | Safari | 17+ (macOS Sonoma+) |
| ☐ | Firefox | Latest (120+) |
| ☐ | Edge | Latest |
| ☐ | Samsung Internet | Latest (common in Indonesia) |
| ☐ | Mobile Safari | iOS 16+ |
| ☐ | Mobile Chrome | Android 13+ |

---

## 8. GO-LIVE CHECKLIST

| # | Item | Owner | Status |
|---|------|-------|--------|
| 1 | All P0 tasks above ☐ checked | Dev | ☐ |
| 2 | Domain DNS configured | DevOps | ☐ |
| 3 | SSL certificate active (Vercel auto-provisions) | DevOps | ☐ |
| 4 | Vercel production deploy successful | Dev | ☐ |
| 5 | Sitemap submitted to Google | SEO | ☐ |
| 6 | robots.txt verified | Dev | ☐ |
| 7 | GA4 receiving data | Analytics | ☐ |
| 8 | WhatsApp number confirmed working | Business | ☐ |
| 9 | Product prices verified against live inventory | Business | ☐ |
| 10 | Legal pages reviewed | Legal | ☐ |
| 11 | Smoke test on production URL | QA | ☐ |
| 12 | Mobile smoke test on real device | QA | ☐ |

---

## 9. POST-LAUNCH MONITORING (24h / 7d / 30d)

### 24 Hours

| ☐ | Check | Tool |
|---|-------|------|
| ☐ | 0 deployment errors | Vercel Dashboard |
| ☐ | Google indexing started | GSC → Pages → "Indexed" count > 0 |
| ☐ | GA4 real-time data | GA4 → Realtime report |
| ☐ | No 404s on key pages | Vercel Analytics or GSC |
| ☐ | WhatsApp messages received | WhatsApp Business |
| ☐ | RFQ submissions working | Manual test submission |

### 7 Days

| ☐ | Check | Target |
|---|-------|--------|
| ☐ | PageSpeed Insights score | > 90 Performance |
| ☐ | Core Web Vitals all green | Vercel Analytics |
| ☐ | Index coverage > 80% | GSC → Pages report |
| ☐ | 0 manual actions in GSC | GSC → Security & Manual Actions |
| ☐ | Average page load < 2s | Vercel Analytics |
| ☐ | 0 unhandled errors | Error monitoring |

### 30 Days

| ☐ | Check | Action |
|---|-------|--------|
| ☐ | Review search queries in GSC | Optimize meta descriptions for low-CTR pages |
| ☐ | Review GA4 conversion funnel | Identify drop-off points (cart→checkout→purchase) |
| ☐ | Review error logs | Fix any recurring errors |
| ☐ | Update product stock/prices | Sync with inventory |
| ☐ | Review dependency updates | `npm outdated`, test, update non-breaking |
| ☐ | User feedback collected | WhatsApp/email inquiries → product improvements |
