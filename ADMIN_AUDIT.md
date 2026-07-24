# Admin Panel Audit — EBTPlaza

**Date**: 2026-07-24  
**Audit Scope**: Full repository scan (admin, dashboard, CMS, auth, database, API routes)

---

## Admin Panel: ❌ Does NOT Exist

No admin panel, dashboard, CMS, or authenticated interface exists anywhere in the codebase.

---

## Authentication: ❌ Not Implemented

- **No middleware** — `src/middleware.ts` does not exist
- **No auth packages** — No next-auth, clerk, auth0, supabase, firebase, jwt, or bcrypt in package.json
- **No login page** — No `/masuk`, `/login`, or `/auth` route
- **No API auth routes** — No `/api/auth` or `/api/admin` endpoints

The entire application is **guest-first by design**. Users browse, search, add to cart, and checkout without any authentication.

---

## Data Source: Static TypeScript Files

All content is stored as **hardcoded TypeScript arrays and objects** in `src/lib/data/`. There is:

- **No database** — No PostgreSQL, MySQL, SQLite, or any DB driver in package.json
- **No CMS** — No Sanity, Strapi, Contentlayer, or any headless CMS
- **No API routes** — `src/app/api/` directory does not exist
- **No ORM** — No Prisma, Drizzle, or Mongoose

---

## Editable Business Data Files (7 files)

All content changes require **code edits and a redeploy**.

### 1. `src/lib/data/products.ts` — 8 products (246 lines)

**Contains**: Product name, slug, description, price, originalPrice, stock, SKU, brandId, categoryId, images, badges, weight, specifications, warranty, affiliateCommission.

**To add a product**: Copy-paste an existing product entry and edit the fields.

### 2. `src/lib/data/categories.ts` — 9 categories (72 lines)

**Contains**: Category id, slug, name, productCount, optional subcategory children.

**To add a category**: Add entry to `categories` array.

### 3. `src/lib/data/brands.ts` — 10 brands (23 lines)

**Contains**: Brand id, slug, name, productCount.

**To add a brand**: Add entry to `brands` array, assign `brandId` in products.

### 4. `src/lib/data/articles.ts` — 4 articles (157 lines)

**Contains**: Article slug, title, excerpt, content (markdown string), category, author, date, readTime.

**To add an article**: Add entry to `articles` array with markdown content.

### 5. `src/lib/data/static-pages.ts` — 5 static pages (156 lines)

**Contains**: About Us, Shipping Policy, Return Policy, Terms & Conditions, Privacy Policy as markdown strings.

**To edit a page**: Edit the `content` string for that page.

### 6. `src/lib/data/banners.ts` — 2 hero banners + 5 need cards (43 lines)

**Contains**: Banner images, alt text, links. Need card icons, titles, descriptions, CTAs.

**To update banners**: Edit the entries in `banners` and `needCards` arrays.

### 7. `src/lib/constants.ts` — 1 site config file (52 lines)

**Contains**: SITE.name, SITE.tagline, SITE.whatsapp, SITE.email, SITE.address, NAV_LINKS, FOOTER_COLUMNS.

**To update contact info**: Edit constants directly.

---

## How Content Is Currently Managed

### Adding a Product
1. Open `src/lib/data/products.ts` in a code editor
2. Copy an existing product block
3. Edit all fields (name, price, stock, etc.)
4. Save the file
5. Run `npm run build`
6. Deploy to Vercel

### Adding an Article
1. Open `src/lib/data/articles.ts`
2. Add a new entry with markdown `content`
3. Run `npm run build` — `generateStaticParams()` auto-generates the new page

### Updating Prices
1. Open `src/lib/data/products.ts`
2. Find the product by `id`
3. Change the `price` field
4. Deploy

### Updating FAQ
FAQ content is hardcoded in `src/app/faq/page.tsx` — not in a data file. Edit the component directly.

---

## Recommendation: Future Admin Panel Architecture

When ready to add an admin panel, here is the **recommended architecture**:

### Where It Should Live

```
src/app/admin/          ← Admin panel routes (protected)
├── layout.tsx          ← Admin layout (sidebar, auth check)
├── page.tsx            ← Admin dashboard
├── login/page.tsx      ← Admin login
├── produk/             ← Product CRUD
├── artikel/            ← Article CRUD
├── kategori/           ← Category CRUD
├── brand/              ← Brand CRUD
└── halaman/            ← Static page editor
```

**Alternative**: If the admin panel is a separate application:
```
apps/admin/             ← Separate Next.js app in a monorepo
```

### How Authentication Would Work

1. **Add middleware** at `src/middleware.ts`:
```typescript
export { auth as middleware } from '@/lib/auth';
export const config = { matcher: ['/admin/:path*'] };
```

2. **Use NextAuth.js** (lightweight, no external service required):
```
npm install next-auth@beta
```
Configure with credentials provider or Google OAuth.

3. **Protect admin routes**: All `/admin/*` routes redirect to `/admin/login` if unauthenticated.

### How Data Would Be Managed

The admin panel should **write to the same API layer** that the frontend reads from. Two approaches:

**Approach A: Database (Recommended for scale)**
```
Admin UI → API Route (POST/PUT/DELETE) → Database → lib/api/products.ts (reads from DB) → Frontend
```
- Add PostgreSQL via Prisma or Neon serverless
- Replace `lib/data/products.ts` with `lib/api/products.ts` DB queries
- Existing function signatures (`getAllProducts()`, `getProductBySlug()`) remain unchanged

**Approach B: Git-based CMS (Simpler, no database)**
```
Admin UI → API Route → Git commit to lib/data/products.ts → Redeploy via Vercel webhook
```
- ContentLayer or Keystatic writes markdown to git
- No database needed
- Deploy on every content change (automatic via Vercel Git integration)

### What Would Change

| Layer | Current | Future (Database) |
|-------|---------|-------------------|
| `lib/data/products.ts` | Static array | **Removed** — data lives in DB |
| `lib/api/products.ts` | Re-exports from data | Fetches from DB |
| `lib/data/categories.ts` | Static array | **Removed** |
| `lib/data/articles.ts` | Static array | **Removed** |
| `lib/data/static-pages.ts` | Markdown strings | **Removed** |
| `src/app/faq/page.tsx` | Hardcoded FAQ | Reads from DB |
| Everything else | Unchanged | **Unchanged** |

**Components that consume these APIs are unchanged** — that's the value of the API layer abstraction.

### Minimal Path (Least Change)

For the smallest possible admin panel today:

1. Add NextAuth.js for authentication
2. Create `src/app/admin/` with login page
3. Build a simple product editor that modifies `src/lib/data/products.ts` on disk (fs.writeFile) — works in development, requires file-based storage in production (e.g., Vercel Blob or GitHub API)
4. Trigger a redeploy after content changes

This avoids adding a database while still providing a UI for editing content.
