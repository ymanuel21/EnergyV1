# EBTPlaza — Energi Terbarukan, Harga Terjangkau!

E-commerce platform for renewable energy products: solar panels, inverters, batteries, PLTS packages, and project procurement. Built with Next.js 16 App Router, TypeScript strict mode, Tailwind CSS v4, and Playwright E2E testing.

---

## Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org) | 16.2.11 | App Router, SSR, ISR, metadata, sitemap |
| [React](https://react.dev) | 19.2.4 | UI components, hooks |
| [TypeScript](https://typescriptlang.org) | 5.x | Strict type checking |
| [Tailwind CSS](https://tailwindcss.com) | 4.x | Utility-first CSS, CSS-based config |
| [Playwright](https://playwright.dev) | 1.61.1 | E2E testing |
| [Prisma](https://prisma.io) | 7.x | ORM for PostgreSQL |
| [Neon](https://neon.tech) | — | Serverless PostgreSQL |
| [NextAuth.js](https://authjs.dev) | 5.x | Authentication (Credentials provider) |
| [class-variance-authority](https://cva.style) | 0.7.1 | Type-safe component variants |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | Conditional classnames |

**Zero runtime state management libraries.** Cart, Wishlist, and Compare use plain React Context + useReducer.

---

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin panel (NextAuth protected)
│   ├── produk/             # Product detail + listing
│   ├── kategori/           # Category pages
│   ├── brand/              # Brand pages
│   ├── artikel/            # Blog articles
│   ├── faq/                # FAQ page
│   ├── halaman/            # Static pages (Tentang, Kebijakan, etc.)
│   ├── cari/               # Search page
│   ├── keranjang/          # Cart page
│   ├── checkout/           # Checkout page
│   ├── wishlist/           # Wishlist (localStorage)
│   ├── perbandingan/       # Product comparison (localStorage)
│   └── permintaan-penawaran/ # RFQ form
├── components/
│   ├── home/               # Homepage sections (Hero, Categories, etc.)
│   ├── product/            # Product card, image gallery, add-to-cart
│   ├── layout/             # Header, Footer, MobileNav
│   ├── cart/               # Cart drawer, cart page components
│   ├── checkout/           # Checkout form, order summary
│   ├── category/           # Category grid, subcategory nav
│   ├── ui/                 # Shared UI primitives (Button, Badge, etc.)
│   └── forms/              # Form inputs, validation
├── lib/
│   ├── api/                # Server-only data access (Prisma-backed)
│   ├── data/               # Static data (fallback for Client Components)
│   ├── db.ts               # Shared Prisma client singleton
│   ├── auth.ts             # NextAuth v5 configuration
│   ├── env.ts              # Environment variable validation
│   └── utils/              # cn(), format(), slug(), validation()
├── providers/              # React Context providers (Cart, Wishlist, Compare, Toast)
├── types/                  # TypeScript type definitions
├── middleware.ts            # Auth middleware (protects /admin/*)
└── next.config.ts          # Next.js config (images, CSP, security headers)
```

---

## Prisma + Neon Database

The project uses Prisma 7 with PostgreSQL on Neon (serverless).

### Schema (8 tables)

- `products` — Solar panels, inverters, batteries, etc.
- `categories` — Product categories with parent/child hierarchy
- `brands` — Product manufacturers
- `articles` — Blog content
- `faqs` — FAQ items
- `pages` — Static pages (Tentang Kami, Kebijakan, etc.)
- `banners` — Hero banners and need cards
- `settings` — Key-value site settings

### Database Setup

```bash
# Set DATABASE_URL in .env
DATABASE_URL=postgresql://...

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npx prisma db seed
```

### Data Access Pattern

**Server Components** use `lib/api/` — Prisma-backed with static data fallback:

```typescript
import { getAllProducts } from '@/lib/api/products';

export default async function ProductsPage() {
  const products = await getAllProducts(); // Prisma if DB available, static data otherwise
}
```

**Client Components** use `lib/data/` directly — synchronous, no Prisma import:

```typescript
import { products } from '@/lib/data/products'; // Only in Client Components
```

---

## Admin Panel

Protected admin panel at `/admin` with NextAuth v5 credentials authentication.

### Access

- **URL**: `/admin`
- **Default credentials**: Set via `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars
- **No hardcoded fallbacks** — missing env vars cause startup failure in production

### Features

| Module | Capabilities |
|--------|-------------|
| Dashboard | Quick actions, stat cards |
| Products | Full CRUD with image upload, slug auto-generation |
| Categories | Create, edit, delete with confirmation |
| Brands | Create, edit, delete with confirmation |
| Articles | Create, edit, delete |
| FAQ | Inline edit, delete with confirmation |
| Pages | Edit static page content (Tentang, Kebijakan, etc.) |
| Banners | Create, edit, delete |
| Settings | Site name, contact info, etc. |

### UX Components

- `DeleteButton` — Inline confirmation dialog before delete
- `SlugInput` — Auto-generates slug from name field
- `SubmitButton` — Disabled while saving, shows loading state
- `AdminToastProvider` — Success/error notifications

---

## Authentication

NextAuth v5 with Credentials provider.

```typescript
// lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Credentials({ ... })],
  pages: { signIn: '/admin/login' },
  session: { strategy: 'jwt' },
});
```

**Middleware** protects all `/admin/*` routes except `/admin/login` and `/api/auth/*`.

---

## Security

### Environment Variables (all required in production)

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password |
| `AUTH_SECRET` | NextAuth JWT encryption key |
| `DATABASE_URL` | PostgreSQL connection string |

Run `npx auth secret` to generate `AUTH_SECRET`.

### Content Security Policy

CSP headers are set in `next.config.ts`:
- Scripts: self + Google Tag Manager
- Styles: self + Google Fonts
- Images: self + data: + blob: + HTTPS
- Connect: self + Google Analytics
- Forms: self only

### Additional Security Headers

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## Image Handling

### ImageUpload Component

Admin panel uses `ImageUpload` — file picker with client-side preview. Stores image URL in Prisma. Ready for UploadThing/Cloudinary integration (swap the upload callback).

### Next.js Image Optimization

```typescript
// next.config.ts
images: {
  formats: ['image/webp'],
  deviceSizes: [640, 768, 1024, 1280, 1536],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

---

## SEO

- **Sitemap**: `app/sitemap.ts` — auto-generated from Prisma data (products, categories, brands, articles, pages)
- **Robots**: `app/robots.ts` — disallows cart, checkout, wishlist, comparison
- **Metadata**: Every page exports `generateMetadata()` with title, description, Open Graph
- **Canonical URLs**: Set for all dynamic routes
- **Structured Data**: Organization, BreadcrumbList, ItemList, FAQPage, Article schemas

---

## Testing

### E2E Tests (Playwright)

```bash
# Start dev server, then:
npx playwright test

# Run specific suite:
npx playwright test tests/e2e/admin/
npx playwright test tests/e2e/smoke/
npx playwright test tests/e2e/critical-path/
```

### Test Suites

| Suite | Tests | Covers |
|-------|-------|--------|
| `smoke/` | Homepage, product detail | Basic rendering |
| `critical-path/` | Category, search, cart, checkout, RFQ | Core user flows |
| `regression/` | Compare, articles | Secondary features |
| `admin/` | Login, logout, dashboard, CRUD | Admin panel |

---

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables

Set all required env vars in Vercel dashboard:

```
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
AUTH_SECRET=...
DATABASE_URL=postgresql://...
```

---

## Maintenance

### Adding New Content

1. **Products**: Go to `/admin/products/new`
2. **Articles**: Go to `/admin/articles/new`
3. **Banners**: Go to `/admin/banners`
4. **FAQ**: Go to `/admin/faq`

### Database Migrations

```bash
# Edit prisma/schema.prisma, then:
npx prisma db push

# Or generate a migration:
npx prisma migrate dev --name descriptive_name
```

### Restoring Backups

Neon provides point-in-time recovery. Use Neon Console to restore to any point in the last 7 days (or longer on paid plans).

---

## Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Generate Prisma client
npx prisma generate

# Start dev server
npm run dev

# Run tests
npx playwright test

# Build
npm run build
```

---

## Production Readiness

| Area | Status |
|------|--------|
| Authentication | ✅ NextAuth v5, no hardcoded fallbacks |
| Database | ✅ Prisma + Neon PostgreSQL |
| API Layer | ✅ Prisma-backed with static fallback |
| CSP Headers | ✅ Configured in next.config.ts |
| SEO | ✅ Sitemap, robots.txt, metadata, structured data |
| Admin UX | ✅ Delete confirmations, slug auto-gen, loading states |
| Image Upload | ✅ Client-side preview, ready for UploadThing |
| E2E Tests | ✅ Public + Admin suites |
| Build | ✅ Passing |
