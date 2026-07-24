# Admin Panel & Database Migration Plan — EBTPlaza

**Document Type**: Technical Architecture Blueprint  
**Date**: 2026-07-24  
**Purpose**: Prepare the codebase so adding an admin panel later requires minimal refactoring.

---

## 1. Current Architecture Assessment

### Content Flow

```
lib/data/products.ts ──┐
lib/data/categories.ts ─┤
lib/data/brands.ts ─────┤──→ lib/api/ ──→ Server Components ──→ HTML
lib/data/articles.ts ───┤       │
lib/data/banners.ts ────┤       ├── getAllProducts()
lib/data/static-pages.ts┘       ├── getProductBySlug()
                                ├── getProductsByCategory()
                                ├── getBrandById()
                                ├── sortProducts()
                                ├── paginate()
                                └── ...
```

### API Layer Coverage

| Content Type | API Functions Exist? | Files Using API | Files Bypassing API |
|-------------|---------------------|-----------------|---------------------|
| Products | ✅ `getAllProducts`, `getProductBySlug`, `getProductsByCategory` | 4 (kategori, cari, promo, clearance) | **6** (homepage, produk detail, brand, wishlist, perbandingan, brand listing) |
| Categories | ❌ No API layer | 0 | 2 (kategori, produk detail) |
| Brands | ✅ Full API | 5 | 0 |
| Articles | ❌ No API layer | 0 | 2 (artikel listing, artikel detail) |
| Static Pages | ❌ No API layer | 0 | 1 (halaman) |
| Banners/Need Cards | ❌ No API layer | 0 | 1 (homepage) |
| FAQ | ❌ Hardcoded in component | 0 | 1 (faq page) |
| Site Settings | ❌ Mixed in constants.ts | 0 | 1 |

**Conclusion**: The API layer exists for products and brands but is **bypassed by 9 files**. Categories, articles, static pages, banners, FAQ, and site settings have **no API layer at all**.

### Gap: Missing API Functions

These should exist before any database migration:
- `getAllArticles()`, `getArticleBySlug()` — articles
- `getAllStaticPages()`, `getStaticPageBySlug()` — static pages
- `getAllCategories()`, `getCategoryBySlug()` — categories
- `getAllFAQs()` — FAQ
- `getSiteSettings()` — site config
- `getHeroBanners()`, `getNeedCards()` — homepage content

---

## 2. CMS Readiness — Per Content Type

### Products

| Aspect | Current | Future (Database) |
|--------|---------|-------------------|
| Data source | `lib/data/products.ts` (TypeScript array) | `products` table in PostgreSQL |
| Records | 8 products | Unlimited |
| Fields | 30+ fields (price, stock, specs, images, badges, etc.) | Same schema, no changes needed |
| API functions | `getAllProducts()`, `getProductBySlug()`, `getProductsByCategory()` | Same signatures — fetch from DB |
| Components using it | ProductCard, ProductDetail, ProductCarouselSection, CategoryPage, SearchPage, BrandPage, WishlistPage, ComparePage, Homepage | **Zero component changes** if API signatures are preserved |
| Admin CRUD | None — edit TypeScript file | Create/Edit/Delete products via admin UI |

**Database table:**
```sql
CREATE TABLE products (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  brand_id      TEXT REFERENCES brands(id),
  category_id   TEXT REFERENCES categories(id),
  subcategory_id TEXT,
  price         INTEGER NOT NULL,
  original_price INTEGER,
  stock         INTEGER DEFAULT 0,
  sku           TEXT,
  model         TEXT,
  description   TEXT,
  images        JSONB DEFAULT '[]',
  badges        JSONB DEFAULT '[]',
  specifications JSONB DEFAULT '[]',
  weight        REAL,
  warranty      TEXT,
  condition     TEXT,
  affiliate_commission JSONB,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Categories

| Aspect | Current | Future |
|--------|---------|--------|
| Data source | `lib/data/categories.ts` | `categories` table |
| Records | 9 categories, 2 subcategories | Unlimited |
| API functions | ❌ None — imported directly | `getAllCategories()`, `getCategoryBySlug()` |
| Components | CategoryNav, CategoryPage, ProductPage breadcrumb | No changes |
| Admin CRUD | None | Create/Edit/Delete categories |

**Database:**
```sql
CREATE TABLE categories (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  parent_id     TEXT REFERENCES categories(id),
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true
);
-- productCount is computed: SELECT COUNT(*) FROM products WHERE category_id = id
```

### Brands

| Aspect | Current | Future |
|--------|---------|--------|
| Data source | `lib/data/brands.ts` | `brands` table |
| Records | 10 brands | Unlimited |
| API functions | ✅ Full API exists | Same signatures |
| Components | BrandPage, ProductCard, Header | No changes |
| Admin CRUD | None | Create/Edit/Delete brands |

**Database:**
```sql
CREATE TABLE brands (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  logo_url      TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
-- productCount is computed
```

### Articles

| Aspect | Current | Future |
|--------|---------|--------|
| Data source | `lib/data/articles.ts` | `articles` table |
| Records | 4 articles | Unlimited |
| API functions | ❌ None | `getAllArticles()`, `getArticleBySlug()` |
| Components | ArticlePage, ArticleDetail | No changes (markdown content stored as text) |
| Admin CRUD | None | Rich text editor for content |

**Database:**
```sql
CREATE TABLE articles (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  excerpt       TEXT,
  content       TEXT NOT NULL,
  category      TEXT,
  author        TEXT DEFAULT 'Tim EBTPlaza',
  image         TEXT,
  read_time     INTEGER,
  is_published  BOOLEAN DEFAULT false,
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### FAQ

| Aspect | Current | Future |
|--------|---------|--------|
| Data source | Hardcoded in `app/faq/page.tsx` (8 items) | `faqs` table |
| API functions | ❌ None | `getAllFAQs()` |
| Admin CRUD | None | Create/Edit/Delete FAQ items |

**Database:**
```sql
CREATE TABLE faqs (
  id            SERIAL PRIMARY KEY,
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  sort_order    INTEGER DEFAULT 0,
  is_active     BOOLEAN DEFAULT true
);
```

### Static Pages

| Aspect | Current | Future |
|--------|---------|--------|
| Data source | `lib/data/static-pages.ts` (5 pages) | `pages` table |
| API functions | ❌ None | `getAllPages()`, `getPageBySlug()` |
| Admin CRUD | None | Rich text editor |

**Database:**
```sql
CREATE TABLE pages (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  content       TEXT NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Site Settings

| Aspect | Current | Future |
|--------|---------|--------|
| Data source | `lib/constants.ts` | `settings` key-value table |
| Fields | name, tagline, whatsapp, email, address, phone | Any number of key-value pairs |
| Admin CRUD | None | Settings form |

**Database:**
```sql
CREATE TABLE settings (
  key           TEXT PRIMARY KEY,
  value         TEXT NOT NULL
);
```

### Hero Banners

| Aspect | Current | Future |
|--------|---------|--------|
| Data source | `lib/data/banners.ts` (2 banners + 5 need cards) | `banners` table |
| API functions | ❌ None | `getActiveBanners()`, `getNeedCards()` |
| Admin CRUD | None | Image upload + link editor |

---

## 3. Admin Panel Design

### Route Structure

```
src/app/admin/                        ← Requires authentication
├── layout.tsx                         ← Admin shell: sidebar, header, auth check
│   ├── AdminSidebar (navigation)
│   ├── AdminHeader (user info, logout)
│   └── {children} (page content)
│
├── login/
│   └── page.tsx                       ← Login form (public, no auth required)
│
├── page.tsx                           ← Dashboard — stats, recent orders, quick links
│
├── produk/
│   ├── page.tsx                       ← Product list with search/filter/pagination
│   ├── baru/page.tsx                  ← Create new product form
│   └── [id]/
│       ├── page.tsx                   ← Edit product form
│       └── actions.ts                 ← Server Actions for CRUD
│
├── kategori/
│   ├── page.tsx                       ← Category list
│   ├── baru/page.tsx                  ← New category
│   └── [id]/page.tsx                  ← Edit category
│
├── brand/
│   ├── page.tsx                       ← Brand list
│   ├── baru/page.tsx                  ← New brand
│   └── [id]/page.tsx                  ← Edit brand
│
├── artikel/
│   ├── page.tsx                       ← Article list (draft/published filter)
│   ├── baru/page.tsx                  ← New article with markdown/WYSIWYG editor
│   └── [id]/page.tsx                  ← Edit article
│
├── faq/
│   └── page.tsx                       ← FAQ list — inline edit, drag-to-reorder
│
├── halaman/
│   ├── page.tsx                       ← Static pages list
│   └── [slug]/page.tsx                ← Edit page content
│
├── pengaturan/
│   └── page.tsx                       ← Settings form — name, contact, social
│
├── pesanan/
│   └── page.tsx                       ← View orders from Google Sheets (read-only)
│
└── komponen/                          ← Optional: server-rendered for admin
    ├── ProductForm.tsx                 ← Reusable product create/edit form
    ├── ArticleEditor.tsx               ← Rich text editor wrapper
    ├── ImageUpload.tsx                 ← File upload with preview
    └── DataTable.tsx                   ← Reusable table with sort/filter/pagination
```

### Dashboard Page

The dashboard shows:
- **Stats cards**: Total products, total orders, total articles, total brands
- **Recent orders**: Last 10 orders from Google Sheets (fetched via API or Sheets integration)
- **Quick actions**: "Tambah Produk", "Tulis Artikel", "Edit Halaman"
- **System status**: Last deploy time, build status

---

## 4. Authentication Recommendation

### Comparison

| Solution | Pros | Cons | Cost |
|----------|------|------|------|
| **NextAuth.js (Auth.js v5)** | Zero vendor lock-in, database-agnostic, credentials + OAuth, middleware-native | Self-hosted, requires DB setup | Free |
| Clerk | Polished UI, social login, MFA, organizations | Vendor lock-in, pricing at scale, external dependency | Free tier: 10,000 MAU |
| Supabase Auth | Built-in with Supabase DB, Row-Level Security, social login | Tied to Supabase ecosystem, less flexible | Free tier: 50,000 MAU |

### Recommendation: **NextAuth.js v5 (Auth.js)**

**Why**:
1. **Zero vendor lock-in** — authentication lives in your database. No external service dependency.
2. **Credentials provider** — simple email/password login for admin users. One table, no third party.
3. **Middleware-native** — `auth()` can be called in Next.js middleware. Protects `/admin/*` routes with a single matcher.
4. **No cost** — completely free. Only requires a database (which we're adding anyway).
5. **Minimal surface area** — single admin user (or small team). No need for social login, organizations, or MFA at this scale.

**Setup complexity**: ~2 hours. One `users` table, one `auth.ts` config, one `middleware.ts`.

**Admin user creation**: First admin is seeded via a database migration script. Additional admins are created from the admin UI.

---

## 5. Database Recommendation

### Comparison

| Solution | Pros | Cons | Cost |
|----------|------|------|------|
| PostgreSQL + Prisma | Full control, mature ORM, type-safe queries | Requires server/pooling | Free (self-hosted) |
| **Neon** | Serverless Postgres, branching (test environments), Vercel-native | Smaller ecosystem than vanilla PG | Free tier: 0.5 GB, 100 branches |
| Supabase | Postgres + Auth + Storage + Realtime, generous free tier | Tied to Supabase platform | Free tier: 500 MB |
| PlanetScale | MySQL, branching, strong free tier | MySQL (not Postgres), no foreign keys on free tier | Free tier: 5 GB |

### Recommendation: **Neon (Serverless PostgreSQL) + Prisma ORM**

**Why**:
1. **Serverless** — no connection pooling headaches. Designed for edge/serverless environments.
2. **Vercel-native** — integrates directly with Vercel. One-click setup.
3. **Branching** — create a test database branch for each PR. Review content changes before merging.
4. **Prisma** — type-safe queries, auto-generated types, migrations. Works perfectly with TypeScript.
5. **Free tier** — 0.5 GB storage, 100 branches. More than enough for 8 products and 4 articles.

**Alternative for simplicity**: Supabase if you want auth + storage + database in one platform. But auth is already handled by NextAuth.js.

---

## 6. API Migration

### Current API (lib/api/products.ts)
```typescript
import { products as productData } from '@/lib/data/products';  // ← Static import

export function getAllProducts(): Product[] {
  return productData;                                           // ← Array return
}
```

### Future API (lib/api/products.ts)
```typescript
import { prisma } from '@/lib/db';                              // ← Database client

export async function getAllProducts(): Promise<Product[]> {
  return prisma.product.findMany({
    where: { isActive: true },
    include: { brand: true, category: true },
    orderBy: { createdAt: 'desc' },
  });                                                           // ← Database query
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return prisma.product.findUnique({
    where: { slug },
    include: { brand: true, category: true },
  });
}
```

### What Changes

| Function | Before | After |
|----------|--------|-------|
| Signature | `Product[]` (sync) | `Promise<Product[]>` (async) |
| Callers | Must add `await` | All Server Components already support async |
| Filter functions | `filterByCategory(products, id)` | `prisma.product.findMany({ where: { categoryId: id } })` |
| Sort | Client-side `sortProducts(array, option)` | `prisma.product.findMany({ orderBy: ... })` |
| Pagination | Client-side `paginate(array, page)` | `prisma.product.findMany({ skip, take })` |

### Impact on Components

**Server Components**: Already support `async/await`. Adding `await` to data calls is a one-line change per file.

**Client Components** (WishlistPage, ComparePage): Currently import `products` directly for display. After migration, they call `getAllProducts()` via an effect or receive products as a prop from a Server Component parent. **This is the only refactor needed** — 2 files.

### Migration Pattern

For every content type, create new API functions BEFORE adding the database:

```
Phase 1: Create API functions wrapping static data
         getAllArticles() → reads from lib/data/articles.ts
         getAllCategories() → reads from lib/data/categories.ts
         ...etc.

Phase 2: Update all components to use API functions
         Replace direct imports with API calls

Phase 3: Swap API implementations
         getAllArticles() → prisma.article.findMany()
         No component changes needed
```

---

## 7. Migration Order — 7 Phases

### Phase 1: Authentication (4 hours)

**Goal**: Protect `/admin/*` routes with login.

Changes:
1. `npm install next-auth@beta @auth/prisma-adapter`
2. Create `src/lib/auth.ts` — NextAuth config (credentials provider)
3. Create `src/app/api/auth/[...nextauth]/route.ts` — Auth handlers
4. Create `src/middleware.ts` — Protect `/admin/*`
5. Create `src/app/admin/login/page.tsx` — Login form
6. Create `src/app/admin/layout.tsx` — Admin shell with auth check

**Files affected**: 6 new files, 0 existing files changed.

**No data migration**. Users table is created via Prisma migration.

### Phase 2: Database Setup (2 hours)

**Goal**: Database connection and schema.

Changes:
1. `npm install @prisma/client && npm install -D prisma`
2. Create `prisma/schema.prisma` — all tables
3. Set `DATABASE_URL` in `.env`
4. Run `npx prisma db push` to create tables
5. Seed script: migrate existing static data to database
6. Create `src/lib/db.ts` — Prisma client singleton

**Files affected**: 3 new files, 0 existing files changed.

### Phase 3: Products CRUD (6 hours)

**Goal**: Admin can create/edit/delete products via UI.

Changes:
1. Create `src/lib/api/products.ts` — replace static with DB queries
2. Add `await` to all 10 product-consuming files
3. Create admin product pages (list, create, edit)
4. Create reusable `ProductForm` component
5. Create Server Actions for CRUD (`createProduct`, `updateProduct`, `deleteProduct`)
6. Migrate `sortProducts` and `paginate` to DB-level queries
7. Remove filter functions that are now SQL `WHERE` clauses

**Files affected**: ~15 files (10 consumers + 5 new admin files).

**Risk**: Medium — touching every product consumer. But changes are mechanical (add `await`).

### Phase 4: Articles & FAQ (3 hours)

**Goal**: Article and FAQ management.

Changes:
1. Create `src/lib/api/articles.ts` — `getAllArticles()`, `getArticleBySlug()`
2. Create `src/lib/api/faqs.ts` — `getAllFAQs()`
3. Update article pages to use API
4. Update FAQ page to use API (currently hardcoded)
5. Create admin article pages
6. Create admin FAQ page (inline editing)

**Files affected**: ~8 files.

### Phase 5: Categories, Brands, Pages, Settings (4 hours)

**Goal**: Complete content management coverage.

Changes:
1. Create `getAllCategories()`, `getCategoryBySlug()` in API
2. Create `getAllPages()`, `getPageBySlug()` in API
3. Create `getAllBanners()`, `getNeedCards()` in API
4. Create `getSiteSettings()` in API
5. Update all consumers
6. Create admin pages for each

**Files affected**: ~10 files.

### Phase 6: Admin Dashboard (3 hours)

**Goal**: Dashboard with stats and quick links.

Changes:
1. Dashboard stats: `prisma.product.count()`, `prisma.article.count()`
2. Recent orders: fetch from Google Sheets or orders table
3. Admin layout polish: sidebar navigation, breadcrumbs

**Files affected**: ~5 new files.

### Phase 7: Analytics & Polish (2 hours)

**Goal**: Production polish.

Changes:
1. Add audit logging (who edited what, when)
2. Image upload to Vercel Blob or Cloudinary
3. Rich text editor for articles and pages (TipTap or MDX editor)
4. Draft/publish workflow for articles and products

---

## 8. Complexity Estimate

| Metric | Estimate |
|--------|----------|
| **Total development hours** | 24 hours (3 person-days) |
| **New files created** | ~30 (admin pages, API, auth, database) |
| **Existing files modified** | ~25 (all consumers must add `await`) |
| **Files removed** | 7 data files (`lib/data/*.ts`) — replaced by database |
| **Breaking changes** | 0 — API signatures preserved, only sync→async change |
| **Risk level** | Medium — wide surface area but mechanical changes |
| **Prerequisite** | Phase 0: Create missing API functions NOW (before database) |

---

## 9. Recommendation

### Should This Project Become Database-Driven?

**For today (8 products, 4 articles): NO.**

The static data approach is the right choice for the current scale:
- **Zero infrastructure** — no database to manage, no connection pools, no migrations
- **Instant deploys** — every page is pre-rendered at build time. No database latency.
- **Zero cost** — no database hosting fees. Vercel free tier is sufficient.
- **Zero complexity** — no async data fetching, no loading states, no error handling for DB failures

**When to migrate**: When any of these become true:

| Trigger | Threshold |
|---------|-----------|
| Product count | > 50 products — editing a 500-line TypeScript file becomes unwieldy |
| Non-technical editors | A marketing/content person needs to update prices or add articles |
| Update frequency | Content changes more than once per week |
| Multiple environments | Need staging/production with different data |

**Recommended next action (today)**:

**Complete the API layer.** Create the missing functions that wrap static data:

```typescript
// lib/api/articles.ts — create NOW
export function getAllArticles() { return articles; }
export function getArticleBySlug(slug: string) { return articles.find(a => a.slug === slug); }

// lib/api/categories.ts — create NOW
export function getAllCategories() { return categories; }
export function getCategoryBySlug(slug: string) { return categories.find(c => c.slug === slug); }

// lib/api/pages.ts — create NOW
export function getPageBySlug(slug: string) { return staticPages.find(p => p.slug === slug); }
export function getAllPages() { return staticPages; }

// lib/api/banners.ts — create NOW
export function getHeroBanners() { return banners; }
export function getNeedCards() { return needCards; }

// lib/api/faqs.ts — create NOW
export function getAllFAQs() { return faqData; }

// lib/api/settings.ts — create NOW
export function getSiteSettings() { return SITE; }
```

Then update the **9 files** that bypass the API layer to use these functions. This costs 1-2 hours and makes the database migration a simple swap of implementation — zero component changes later.
