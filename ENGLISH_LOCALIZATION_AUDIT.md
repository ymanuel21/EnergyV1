# EBT Plaza — English Localization Audit

Phase 1 deliverable. Read-only inspection; **no changes were made to any production system**.

## 1. What serves ebtplaza.com

| Item | Value |
| --- | --- |
| Git repository | `https://github.com/ymanuel21/EnergyV1` |
| Production branch | `main` (remote default, `HEAD` = `ac10d5f`) |
| Vercel project | `ebt` — `prj_MFf0wKTxldnSNjSYWMIx0odblZAj` (team `ebt-plaza`) |
| Production domain | `ebtplaza.com`, `www.ebtplaza.com` |
| Framework | Next.js 16.2.11 (App Router) + React + TypeScript |
| Data layer | Prisma 7 → Neon Postgres (Singapore) |
| Auth | next-auth (admin only) |
| Output mode | `next build` with `output: 'standalone'`-style Vercel build |
| Existing i18n | **None.** No next-intl / i18next / locale routing / message catalogues |

The working checkout at `/Users/document/EnergyV1` is on the *unrelated* branch
`deploy/category-restructure` with 116 uncommitted files, and is linked to the **old**
`energyv1` Vercel project. It was left completely untouched: all localization work happens in a
separate `git worktree` (`/Users/document/EnergyV1-english`) branched from `origin/main`.

## 2. Public route inventory (22 routes)

| Route | Purpose | Indonesian URL slug (preserved) |
| --- | --- | --- |
| `/` | Homepage | — |
| `/produk` | Product listing | produk = product |
| `/produk/[slug]` | Product detail (224 prerendered) | |
| `/kategori/[slug]` | Category listing | kategori = category |
| `/brand` , `/brand/[slug]` | Brand index / detail | brand (loanword) |
| `/proyek` , `/proyek/[slug]` | Project case studies | proyek = project |
| `/artikel` , `/artikel/[slug]` | Blog / articles | artikel = article |
| `/faq` | FAQ | faq (loanword) |
| `/promo` | Promotions | promo (loanword) |
| `/keranjang` | Cart | keranjang = basket/cart |
| `/checkout` | Checkout | (loanword) |
| `/perbandingan` | Product comparison | perbandingan = comparison |
| `/wishlist` | Wishlist | (loanword) |
| `/testimoni` | Testimonials | testimoni = testimonial |
| `/cari` | Search | cari = search |
| `/permintaan-penawaran` | Request a quote | permintaan penawaran = quotation request |
| `/barang-clearance` | Clearance goods | barang clearance = clearance goods |
| `/halaman/[slug]` | Static pages | halaman = page |
| `/[slug]` | Catch-all static page | |
| `/sitemap.xml`, `/robots.txt` | SEO | |
| `not-found` | 404 page | |

**Decision:** URL slugs stay Indonesian. The brief requires *"Preserve existing routes and URL
structure wherever possible"* and *"preserving relevant page intent and URLs"* — renaming slugs
would break every indexed URL and internal link. Routes are structure; the copy inside them becomes
English.

## 3. Where the text lives

### 3a. In the repository (77 of 305 source files contain Indonesian)

| Area | Examples |
| --- | --- |
| Root layout | `<html lang="id">`, default metadata |
| Header / mobile menu | nav labels, CTA button |
| Footer | column headings, legal notice, contact labels |
| Homepage sections | section eyebrows/headings/subcopy, CTA labels |
| Product pages | filters, sort labels, "add to cart", stock/condition labels |
| Cart / checkout | step labels, table headers, totals, buttons |
| Comparison / wishlist | empty states, column headers, actions |
| Quote request form | field labels, placeholders, **validation messages**, success/failure copy |
| Search | placeholder, result counts, empty state |
| FAQ / articles / projects / testimonials / promo | page headings, categories, metadata |
| Dynamic strings | cart quantities, result counts, relative dates, price labels |
| Metadata | `title`, `description`, OpenGraph, per-page `generateMetadata` |
| Static fallback data | `src/lib/data/{categories,products,articles,brands,static-pages}.ts` |

### 3b. In the database (Neon Postgres) — customer-facing content

| Table | Rows | Indonesian content | Volume |
| --- | --- | --- | --- |
| `products` | 336 | `description` (101 rows) — **names already English** | 190,295 chars |
| `categories` | 55 | `name` (e.g. "Panel Surya", "Baterai") | 760 chars |
| `articles` | 4 | title, excerpt, content | 3,680 chars |
| `faqs` | 7 | question, answer | 1,315 chars |
| `pages` | 5 | title, content (legal/policy) | 5,571 chars |
| `projects` | 13 | shortDescription, industry, customer | 1,643 chars |
| `testimonials` | 16 | quote (real customer words) | 2,965 chars |
| `navigation_links` | 33 | label (9 rows) | 789 chars |
| `homepage_section_versions` | 8 | title, subtitle | 266 chars |
| `settings` | 10 | value | 343 chars |
| **Total** | | | **~207,600 chars** |

**Not translated (deliberately):** `quote_requests.message` and `.notes` hold *real customer
submissions*; `activity_logs`, `product_events`, `revisions`, `assets`, `_vercel_*` are internal;
`products.slug` / `brands.slug` / `navigation_links.href` are URL identifiers; `brand` and product
**names** are proper nouns and are already English.

## 4. Approach (agreed with the client)

1. **Database is never written to.** English content lives in a new application-layer overlay
   (`src/lib/i18n/`) applied on the *public read path only*. Admin screens read the untouched
   Indonesian rows, so staff can never accidentally save translated values back.
   Reversal = delete one module.
2. **Code copy** is translated in place on a dedicated branch — reversal = `git revert`.
3. **Testimonials** are translated faithfully with names kept, and every one is **flagged for
   client review**.
4. **Legal/policy pages** are translated accurately and **flagged for qualified review**.

## 5. Checklist of text locations

All items below were actioned in Phase 2. See `docs/i18n/IMPLEMENTATION.md`.

- [x] `<html lang>` + locale metadata → `lang="en"`, `og:locale` `en_US`
- [x] Root metadata + per-page `generateMetadata` (title, description, OG)
- [x] Header: desktop nav, dropdowns, mobile menu, CTA
- [x] Footer: all columns, contact labels, legal line
- [x] Homepage: every section heading, subcopy, CTA
- [x] Product listing/detail: filters, sort, badges, stock, condition, warranty, specs
- [x] Cart / checkout: steps, headers, totals, buttons, empty state
- [x] Comparison / wishlist: headers, empty states
- [x] Quote form: labels, placeholders, validation, success/failure
- [x] Search: placeholder, counts, empty state
- [x] FAQ / articles / projects / testimonials / promo pages
- [x] 404 and error pages
- [x] Dynamic/runtime strings (counts, dates, currency labels)
- [x] Accessibility labels, `aria-label`, `alt`, tooltips, screen-reader text
- [x] Static fallback datasets in `src/lib/data/`
- [x] Database content via the overlay (all tables in §3b)

Additional text locations found while implementing, beyond the original list:

- [x] `Product.specifications` — a normalised `{category,key,label,value}` spec table on 230 products
      (3,088 rows), covered by shared dictionaries in `src/lib/i18n/data/spec-terms.en.json`
- [x] `Project.storyData` / `seoData` / `highlights` / `impactData` / `pvModule` / `inverter` / `battery`
- [x] `Product.warranty` (`5 Tahun` → `5 Years`) and `Product.name` (`(Alumunium)` → `(Aluminium)`)
- [x] `Article.category` / `author`, `Testimonial.role` / `company`
- [x] WhatsApp message templates composed in the client (product enquiry, RFQ import)

## 6. Deliberately left in Indonesian

The admin CMS (`src/app/admin/**`, `src/components/admin/**`), dev scripts (`src/scripts/**`),
`src/lib/static-page-templates.ts` and the admin module registry — internal tooling for
Indonesian-speaking staff, none of it customer-facing.
