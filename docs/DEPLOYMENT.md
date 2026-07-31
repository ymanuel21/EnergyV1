# EBTPlaza Deployment Guide

This document is based only on the repository contents in `/Users/document/EnergyV1`.
Where the repository does not define something, it is marked exactly as:

**Not detected from the repository.**

---

## 1. Project Overview

- **Framework:** Next.js 16.2.11 using the App Router.
- **Node version:** Node.js 20 in CI (`.github/workflows/quality.yml`).
- **Package manager:** npm (`package-lock.json` v3 is present; `npm ci` is used in CI).
- **Database:** PostgreSQL.
- **ORM:** Prisma 7.x.
- **Authentication:** NextAuth.js v5 credentials flow.
- **Storage provider:** Not detected from the repository.
  - Image uploads are stored in PostgreSQL `Asset` records as base64 data and served back through `/api/asset/[id]`.
- **Email provider:** Not detected from the repository.
- **Third-party services detected in code:**
  - Google Sheets via Google Apps Script Web App for checkout order storage (`NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL`).
  - Google Tag Manager / Google Analytics in CSP allowlist.
  - Google Fonts in CSP allowlist.
  - WhatsApp links via `wa.me` URLs.
- **Middleware:** Not detected from the repository.
  - Admin protection is implemented in `src/app/admin/layout.tsx` and NextAuth routes instead.

### Project areas present in `src/app`

Public pages detected in the repository:
- Homepage: `/`
- Product listing/detail: `/produk`, `/produk/[slug]`
- Categories: `/kategori/[slug]`
- Brands: `/brand`, `/brand/[slug]`
- Projects: `/proyek`, `/proyek/[slug]`
- Articles: `/artikel`, `/artikel/[slug]`
- FAQ: `/faq`
- Static pages: `/halaman/[slug]`
- Search: `/cari`
- Cart: `/keranjang`
- Checkout: `/checkout`
- Wishlist: `/wishlist`
- Compare: `/perbandingan`
- RFQ / quote request: `/permintaan-penawaran`
- Promo: `/promo`
- Clearance: `/barang-clearance`
- Testimonials: `/testimoni`
- Admin CMS: `/admin/*`

---

## 2. Server Requirements

### Minimum VPS requirements

**Not detected from the repository.**

Operational minimum based on the codebase:
- Linux server with Node.js support
- npm
- Access to a PostgreSQL database
- Ability to run `next build` and `next start`

### Recommended production specs

**Not detected from the repository.**

For production deployment of this stack, use a VPS that can comfortably run:
- Next.js server process
- Prisma client against PostgreSQL
- Reverse proxy (Nginx)
- Background shell access for deployments and backups

### Operating System

**Not detected from the repository.**

The handoff request specifies Ubuntu, so the deployment steps below assume Ubuntu Server.

### Required software

Detected from the repository:
- Node.js 20.x
- npm
- PostgreSQL client tools (`psql`, `pg_dump`) for backup and restore
- Nginx for reverse proxy
- Certbot for HTTPS

Repository scripts also rely on:
- Prisma CLI (`npx prisma`)
- `tsx` for seed and maintenance scripts

---

## 3. Environment Variables

### Required by runtime validation

`src/lib/env.ts` enforces these at runtime:

| Variable | Required | What it does |
|---|---:|---|
| `ADMIN_EMAIL` | Yes | Admin login email checked by `src/lib/auth.ts`.
| `ADMIN_PASSWORD` | Yes | Admin login password checked by `src/lib/auth.ts`.
| `AUTH_SECRET` | Yes | NextAuth JWT signing/encryption secret.
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma and seed scripts.

### Detected optional environment variables

| Variable | Required | What it does |
|---|---:|---|
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical site URL used in metadata and sitemap. Falls back to `https://ebtplaza.vercel.app` in code.
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | WhatsApp number used for product/RFQ links. Falls back to `6282112850215` in code.
| `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` | Optional | Google Apps Script Web App endpoint for checkout order storage. If missing, orders are not sent to Sheets.
| `NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT` | Optional | Admin idle timeout in milliseconds for `SessionManager`. Defaults to `1800000` (30 minutes).
| `VERCEL_GIT_COMMIT_SHA` | Optional | Used by `/api/health` for a short version identifier.

### Variables mentioned in repository docs but not confirmed in runtime code

- `NEXT_PUBLIC_X` - Not detected from the repository.

### Proposed `.env.example`

```env
# Required
ADMIN_EMAIL=admin@ebtplaza.com
ADMIN_PASSWORD=change-me
AUTH_SECRET=generate-with-npx-auth-secret
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public

# Optional
NEXT_PUBLIC_SITE_URL=https://energi.click
NEXT_PUBLIC_WHATSAPP_NUMBER=6282112850215
NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL=
NEXT_PUBLIC_ADMIN_IDLE_TIMEOUT=1800000
```

### Notes on repository env files

- Root `.env.example` currently contains `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, and `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL`.
- The codebase also requires `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, and `DATABASE_URL`.
- Repository docs are therefore incomplete as an environment bootstrap reference unless the sample above is used.

---

## 4. Database

### How to create the database

The repository does not include a database provisioning script.

Use a PostgreSQL database and set `DATABASE_URL` to its connection string.

### How to run Prisma migrations

Repository evidence:
- Prisma schema exists at `prisma/schema.prisma`.
- Migrations exist in `prisma/migrations/`.
- `migration_lock.toml` confirms the provider is PostgreSQL.

Production-safe flow:
```bash
npx prisma migrate deploy
```

If you only need to sync schema in a non-production environment, the repository docs also mention:
```bash
npx prisma db push
```

### How to seed

Seed scripts detected in the repository:
- `npx tsx prisma/seed/index.ts`
- `npx tsx prisma/seed/catalog.ts`
- `npx tsx prisma/seed/homepage.ts`
- `npx tsx prisma/seed/admin.ts`
- `npx tsx prisma/seed/projects.ts`

Seeding notes:
- Seeds are written to be idempotent.
- `prisma/seed/admin.ts` creates an admin user from `ADMIN_EMAIL` if one does not already exist.
- `prisma/seed/catalog.ts` restores brands, categories, and badges.
- `prisma/seed/homepage.ts` restores homepage sections and versions.

### How to verify the schema

Repository-backed checks:
```bash
npx prisma validate
npx tsx scripts/check-data-integrity.ts
```

Useful verification endpoints and commands:
- `GET /api/health` returns database health and a version marker.
- `npx prisma db push` is mentioned in repository backup/recovery docs after restore.

---

## 5. Installation

### Step-by-step on a fresh Ubuntu server

1. Update the server.
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

2. Install required packages.
   ```bash
   sudo apt install -y git curl ca-certificates build-essential nginx postgresql-client
   ```

3. Install Node.js 20.x.
   - Not detected from the repository as an installer script.
   - The repository CI uses Node.js 20.
   - Use your preferred Node 20 installation method on Ubuntu.

4. Clone the repository.
   ```bash
   git clone <REPOSITORY_URL> EnergyV1
   cd EnergyV1
   ```

5. Create the environment file.
   ```bash
   cp .env.example .env
   ```

6. Fill in the required environment variables.
   - Use the sample in section 3.

7. Install dependencies.
   ```bash
   npm install
   ```

   Note:
   - `package.json` has a `postinstall` script that runs `prisma generate` automatically.

8. Run Prisma generation explicitly if needed.
   ```bash
   npx prisma generate
   ```

9. Run migrations.
   ```bash
   npx prisma migrate deploy
   ```

10. Seed data if the deployment needs the CMS content.
    ```bash
    npx tsx prisma/seed/index.ts
    ```

11. Build the application.
    ```bash
    npm run build
    ```

12. Start the application.
    ```bash
    npm run start
    ```

### Build scripts detected in `package.json`

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Local development server |
| `build` | `next build` | Production build |
| `start` | `next start` | Production server |
| `lint` | `eslint` | Linting |
| `postinstall` | `prisma generate` | Generate Prisma client after install |

---

## 6. Process Manager

PM2 is not configured in the repository, but it is a reasonable production process manager for this app.

### Recommended PM2 commands

```bash
npm install -g pm2
pm2 start npm --name ebtplaza -- start
pm2 save
pm2 startup
```

### Useful restart/update commands

```bash
pm2 restart ebtplaza
pm2 reload ebtplaza
pm2 logs ebtplaza
pm2 status
```

---

## 7. Reverse Proxy

The repository does not include an Nginx config, so the following is a deployment template for this Next.js app.

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_vary on;
    gzip_proxied any;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml+rss
        image/svg+xml;

    client_max_body_size 20m;

    location /_next/static/ {
        alias /Users/document/EnergyV1/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Notes

- WebSocket headers are included for compatibility.
- Static asset caching is handled for `/_next/static/`.
- The repository’s security headers live in `next.config.ts`; Nginx should not remove them.
- Adjust `client_max_body_size` if you expect larger uploads.

---

## 8. SSL

The repository does not contain SSL automation.

### Let's Encrypt setup

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
```

### Renewal

```bash
sudo certbot renew --dry-run
```

The OS normally installs a renewal timer automatically after Certbot setup.

---

## 9. Deployment

### Deploying updates on the server

1. Pull the latest code.
   ```bash
   git pull
   ```

2. Install dependencies if they changed.
   ```bash
   npm install
   ```

3. Generate Prisma client if needed.
   ```bash
   npx prisma generate
   ```

4. Apply database migrations.
   ```bash
   npx prisma migrate deploy
   ```

5. Build the app.
   ```bash
   npm run build
   ```

6. Restart the process manager.
   ```bash
   pm2 restart ebtplaza
   ```

### Repository deployment references

- README mentions Vercel deployment with `vercel --prod`.
- The current repo also contains a GitHub Actions quality workflow that runs type-checking, build, and Playwright.
- No Docker deployment flow is detected.

---

## 10. Backup

### Database backup

Repository backup docs recommend PostgreSQL dump-based backups:

```bash
pg_dump "$DATABASE_URL" --no-owner --no-acl > backup-$(date +%Y%m%d).sql
```

Specific tables:
```bash
pg_dump "$DATABASE_URL" --table=products --table=brands > catalog-backup.sql
```

### Uploads backup

Not detected from the repository as a separate file-storage service.

Because assets are stored in PostgreSQL as base64 rows in the `assets` table, the database backup also backs up uploaded images.

### Restore procedure

```bash
psql "$DATABASE_URL" < backup-20250101.sql
```

After restore:
```bash
npx prisma db push
npx tsx scripts/check-data-integrity.ts
```

Repository recovery docs also include idempotent seed restore commands:
```bash
npx tsx prisma/seed/index.ts
npx tsx prisma/seed/catalog.ts
npx tsx prisma/seed/homepage.ts
npx tsx prisma/seed/admin.ts
```

---

## 11. Troubleshooting

### Missing env

- `src/lib/env.ts` throws a runtime error when required variables are missing.
- Required variables are `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, and `DATABASE_URL`.

### Prisma

Common symptoms:
- Build or runtime errors mentioning `DATABASE_URL` or Prisma connection issues.
- `src/lib/db.ts` throws if `DATABASE_URL` is not set.

Checks:
```bash
npx prisma generate
npx prisma migrate deploy
```

### Permissions

- The repository does not define file-system permission requirements.
- On Ubuntu, ensure the app user can read the repo and write logs or runtime files used by PM2.

### Uploads

- Uploads are handled by `POST /api/upload`.
- It stores a base64 data URL in the `assets` table and returns `/api/asset/[id]`.
- If uploads fail, check PostgreSQL connectivity and database permissions.

### Authentication

- Admin login uses NextAuth credentials with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- `/admin/login` posts to `/api/login`.
- `/api/login` rate-limits login attempts in production.
- `/api/admin/session/refresh` depends on `AUTH_SECRET`.

### Hydration

**Not detected from the repository.**

### 500 errors

Known server-side risk from repository instructions:
- Admin pages must not import modules that transitively import `pg.Pool` at the top level.
- Use `getAdminPrisma()` directly or lazy `await import()` inside server actions.
- The repo’s `AGENTS.md` recommends running `npx tsx scripts/check-pg-pool-imports.ts` to detect violations.

### Health check

```bash
curl https://example.com/api/health
```

Expected response includes:
- `database: connected`
- `status: healthy` when the DB query succeeds

---

## 12. Verification Checklist

### Public pages

Verify these pages load without errors:
- `/`
- `/produk`
- `/produk/[slug]`
- `/kategori/[slug]`
- `/brand`
- `/brand/[slug]`
- `/proyek`
- `/proyek/[slug]`
- `/artikel`
- `/artikel/[slug]`
- `/faq`
- `/halaman/[slug]`
- `/promo`
- `/barang-clearance`
- `/cari`
- `/keranjang`
- `/checkout`
- `/wishlist`
- `/perbandingan`
- `/permintaan-penawaran`
- `/testimoni`

### Admin

Verify:
- `/admin/login`
- `/admin`
- Products CRUD
- Categories CRUD
- Brands CRUD
- Articles CRUD
- FAQ CRUD
- Pages CRUD
- Banners CRUD
- Settings
- Homepage builder
- Media manager
- Navigation manager
- Quotes
- Reviews
- Projects
- Testimonials

### Login

- Valid admin credentials authenticate successfully.
- Invalid credentials return to `/admin/login`.
- Session refresh works when the admin is idle.

### Homepage

- Homepage loads hero, sections, and footer correctly.
- Theme settings load from the database when available.
- Navigation and WhatsApp CTA render correctly.

### Products

- Product listing loads.
- Product detail pages render title, price, images, and specs.
- Search suggestions and global search work.
- Compare, wishlist, and cart pages open correctly.

### Projects

- Project listing loads.
- Project detail pages render without missing data.
- Published projects are visible and slugs resolve correctly.

### CMS

- Admin CMS pages open and render with authenticated session.
- CRUD flows save to PostgreSQL.
- Images uploaded in admin can be retrieved via `/api/asset/[id]`.

### Publishing

- Homepage versions can be drafted and published.
- Product, project, article, page, and banner publishing flows work.
- Review status flows are visible in admin review screens.

---

## 13. Maintenance

### Updating dependencies

- Use `npm install` to update packages.
- Run `npm run build` after dependency upgrades.
- Run Playwright tests after changes.

### Rotating secrets

Rotate these secrets if compromised:
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `DATABASE_URL`
- Any Google Sheets deployment URL or related Apps Script credentials outside the repo

### Database maintenance

- Use `pg_dump` backups regularly.
- Run migrations with `npx prisma migrate deploy`.
- Run integrity checks with `npx tsx scripts/check-data-integrity.ts`.

### Log cleanup

**Not detected from the repository.**

### PM2 monitoring

```bash
pm2 status
pm2 logs ebtplaza
pm2 monit
```

---

## 14. Security

Repository-detected security controls:
- CSP headers in `next.config.ts`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- Login rate limiting in `src/lib/rate-limit.ts` and `src/app/api/login/route.ts`
- HttpOnly SameSite session cookies in NextAuth and session refresh logic

### Production recommendations

- Put the app behind HTTPS only.
- Keep `AUTH_SECRET` and `DATABASE_URL` out of the repo.
- Do not expose admin credentials in client-side code.
- Keep PostgreSQL accessible only from the application host or trusted network.
- Review admin imports carefully to avoid the `pg.Pool` crash pattern documented in `AGENTS.md`.
- Add server-level rate limiting if needed for routes beyond `/api/login`.

### Rate limiting

- Implemented in repository only for admin login.
- Not detected from the repository for other API routes.

### Headers

Next.js config already sets the security headers listed above.

### Cookies

- NextAuth session cookies are HTTP-only and SameSite `lax`.
- Session refresh reissues the cookie with 24-hour expiry.

### Secrets

- Use deployment environment variables only.
- Do not commit `.env`.

---

## Appendix: Repository Notes

### Files that define deployment behavior

- `package.json`
- `package-lock.json`
- `next.config.ts`
- `prisma/schema.prisma`
- `prisma/migrations/`
- `src/lib/auth.ts`
- `src/lib/db.ts`
- `src/lib/env.ts`
- `src/lib/site.ts`
- `src/lib/api/sheets.ts`
- `src/app/api/upload/route.ts`
- `src/app/api/asset/[id]/route.ts`
- `src/app/api/login/route.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/health/route.ts`
- `src/components/admin/SessionManager.tsx`
- `src/app/admin/layout.tsx`
- `.github/workflows/quality.yml`
- `README.md`
- `docs/BACKUP.md`
- `docs/DATA_RECOVERY.md`

### Not detected from the repository

- Docker files
- A dedicated `middleware.ts`
- A dedicated PM2 configuration file
- An explicit email provider
- An external image storage provider
- A formal Node version file such as `.nvmrc`
