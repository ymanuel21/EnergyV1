# EBTPlaza — Feature Inventory & Pricing Catalogue
> Generated from live codebase analysis · July 31, 2026

---

## Module 1: Public Website (Storefront)

### 1.1 Homepage (Dynamic Sections)
**Complexity**: Enterprise | **Est. Effort**: 40h | **Price**: Rp 15.000.000

Drag-and-drop homepage builder with 6 section types:
- Hero (with configurable product image, tagline, CTA)
- Featured Products (single/multi product showcase with tabs)
- Category Grid (auto-populated)
- Brand Showcase
- CTA Section
- Project Portfolio (featured + grid with manual selection)

Each section: title/subtitle editable, visibility toggle, advanced styling (background, padding, animation, CSS class).

### 1.2 Product Catalog
**Complexity**: Advanced | **Est. Effort**: 25h | **Price**: Rp 10.000.000

- Grid/list product listing with pagination (24/48/96 per page)
- Sort: newest, price asc/desc, name
- Filters: brand, category
- Search with autocomplete (debounced, product images in dropdown)
- Product card: image, name, price, badge, hover lift
- URL-based filtering (SSR-compatible)

### 1.3 Product Detail Page
**Complexity**: Advanced | **Est. Effort**: 20h | **Price**: Rp 8.000.000

- Image gallery with zoom
- Price display (original, sale, contact-for-price)
- Specifications tab
- Downloads tab
- Shipping & warranty tab
- Add-to-cart, wishlist, compare toggle
- Related products
- Breadcrumb navigation
- Structured data (Schema.org Product)

### 1.4 Project Portfolio
**Complexity**: Advanced | **Est. Effort**: 15h | **Price**: Rp 6.000.000

- Public project listing page
- Project detail page with categories: residential, commercial, industrial
- Filter by industry, system type
- CTAs: "Ajukan Proyek Serupa"

### 1.5 Brand Directory
**Complexity**: Medium | **Est. Effort**: 8h | **Price**: Rp 3.500.000

- All brands page with logos
- Individual brand pages with products

### 1.6 Article / Blog
**Complexity**: Medium | **Est. Effort**: 10h | **Price**: Rp 4.000.000

- Article listing with category filter
- Article detail with rich content
- Author, read time, publish date

### 1.7 FAQ
**Complexity**: Simple | **Est. Effort**: 5h | **Price**: Rp 2.000.000

- Accordion FAQ listing
- Searchable
- CMS-managed

### 1.8 Static Pages
**Complexity**: Medium | **Est. Effort**: 6h | **Price**: Rp 2.500.000

- Privacy, Terms, About, Shipping, Returns
- CMS-managed content

### 1.9 Search (Global)
**Complexity**: Advanced | **Est. Effort**: 12h | **Price**: Rp 5.000.000

- Autocomplete with product images, brand, price
- Full search results page
- Debounced, keyboard-navigable

### 1.10 Cart & Checkout
**Complexity**: Advanced | **Est. Effort**: 15h | **Price**: Rp 6.000.000
**Status**: PARTIAL (cart works, checkout pending)

### 1.11 Wishlist
**Complexity**: Medium | **Est. Effort**: 6h | **Price**: Rp 2.500.000

- Add/remove products
- Persistent across sessions

### 1.12 Compare Products
**Complexity**: Medium | **Est. Effort**: 8h | **Price**: Rp 3.500.000

- Select up to 4 products
- Side-by-side comparison

### 1.13 Quote Request
**Complexity**: Medium | **Est. Effort**: 8h | **Price**: Rp 3.500.000

- Custom quote form
- Admin management of incoming requests

### 1.14 Newsletter Signup
**Complexity**: Simple | **Est. Effort**: 3h | **Price**: Rp 1.500.000

### 1.15 WhatsApp Floating Button
**Complexity**: Simple | **Est. Effort**: 2h | **Price**: Rp 1.000.000

---

## Module 2: Admin CMS

### 2.1 Product Management
**Complexity**: Enterprise | **Est. Effort**: 30h | **Price**: Rp 12.000.000

- CRUD operations
- Draft/publish/archive workflow
- Image upload, gallery management
- Specifications editor
- Badge assignment
- Related products linking
- Bulk import/export
- Search/filter/pagination

### 2.2 Homepage Builder
**Complexity**: Enterprise | **Est. Effort**: 50h | **Price**: Rp 20.000.000

- Section registry system (6 section types)
- Drag-to-reorder sections
- Inline field editor per section
- Product/project pickers with autocomplete
- Draft/Published versioning per section
- Live preview iframe
- Publish with cache revalidation
- Content/Styling/Advanced tabs per section
- History/revision tracking

### 2.3 Project Management
**Complexity**: Advanced | **Est. Effort**: 15h | **Price**: Rp 6.000.000

- Full CRUD
- Rich metadata: industry, system type, capacity, customer
- Image gallery, highlights, impact data
- SEO data per project
- Featured toggle
- Draft/publish workflow
- Review system for content approval

### 2.4 Category Management
**Complexity**: Medium | **Est. Effort**: 8h | **Price**: Rp 3.500.000

### 2.5 Brand Management
**Complexity**: Medium | **Est. Effort**: 6h | **Price**: Rp 2.500.000

### 2.6 Banner Management
**Complexity**: Medium | **Est. Effort**: 5h | **Price**: Rp 2.000.000

### 2.7 Article Management
**Complexity**: Advanced | **Est. Effort**: 10h | **Price**: Rp 4.000.000

- Rich text editor
- Publish/draft workflow
- Category assignment

### 2.8 FAQ Management
**Complexity**: Simple | **Est. Effort**: 4h | **Price**: Rp 1.500.000

### 2.9 Pages Management
**Complexity**: Medium | **Est. Effort**: 5h | **Price**: Rp 2.000.000

### 2.10 Testimonial Management
**Complexity**: Medium | **Est. Effort**: 6h | **Price**: Rp 2.500.000

- Rating, company, role
- Featured toggle

### 2.11 Navigation Manager
**Complexity**: Advanced | **Est. Effort**: 8h | **Price**: Rp 3.500.000

- Multi-group navigation (header, footer)
- Drag-to-reorder links

### 2.12 Media Manager
**Complexity**: Medium | **Est. Effort**: 8h | **Price**: Rp 3.500.000

- Upload, browse, delete assets
- Image optimization

### 2.13 Appearance / Theme Editor
**Complexity**: Advanced | **Est. Effort**: 12h | **Price**: Rp 5.000.000

- Primary/hover/surface/border color customization
- Border radius control
- Container width
- Dark mode support

### 2.14 Quote Request Management
**Complexity**: Medium | **Est. Effort**: 5h | **Price**: Rp 2.000.000

### 2.15 Activity Log
**Complexity**: Medium | **Est. Effort**: 5h | **Price**: Rp 2.000.000

- Audit trail of all admin actions

### 2.16 Settings (Global)
**Complexity**: Simple | **Est. Effort**: 3h | **Price**: Rp 1.500.000

---

## Module 3: Technical Infrastructure

### 3.1 Authentication (NextAuth v5)
**Complexity**: Advanced | **Est. Effort**: 12h | **Price**: Rp 5.000.000

- Email/password credentials
- Session management
- Role-based access (owner, admin, editor, viewer)
- Permission system
- CSRF protection

### 3.2 Database (PostgreSQL + Prisma v7)
**Complexity**: Enterprise | **Est. Effort**: 20h | **Price**: Rp 8.000.000

- 26 models with relations
- Transaction support
- Draft/publish versioning system
- Revision history
- Connection pooling (Neon serverless)

### 3.3 API Layer
**Complexity**: Advanced | **Est. Effort**: 15h | **Price**: Rp 6.000.000

- 25+ API routes
- RESTful design
- Server-side validation (Zod)
- Rate limiting
- Cache revalidation

### 3.4 SEO
**Complexity**: Advanced | **Est. Effort**: 8h | **Price**: Rp 3.500.000

- Dynamic metadata per page
- Canonical URLs
- Open Graph / Twitter Cards
- Structured Data (Schema.org)
- Sitemap

### 3.5 Image Optimization
**Complexity**: Medium | **Est. Effort**: 5h | **Price**: Rp 2.000.000

- Next/Image with CDN
- SafeImage wrapper (error fallback to placeholder)
- Responsive sizes

### 3.6 Search Engine
**Complexity**: Advanced | **Est. Effort**: 10h | **Price**: Rp 4.000.000

- Full-text search on products
- Autocomplete for products and projects
- Debounced API calls

### 3.7 Responsive Design
**Complexity**: Enterprise | **Est. Effort**: 15h | **Price**: Rp 6.000.000

- Mobile-first Tailwind CSS
- Adaptive layouts
- Touch-friendly UI

### 3.8 Performance
**Complexity**: Advanced | **Est. Effort**: 8h | **Price**: Rp 3.500.000

- Next.js App Router with RSC
- Turbopack builds
- SSG for static pages
- ISR for catalog
- Lazy loading

### 3.9 Analytics
**Complexity**: Medium | **Est. Effort**: 5h | **Price**: Rp 2.000.000

- Product event tracking (view, search, cart)
- Session tracking

### 3.10 Email Notifications
**Complexity**: Medium | **Est. Effort**: 6h | **Price**: Rp 2.500.000
**Status**: PARTIAL

---

## Module 4: QA & Automation

### 4.1 Playwright E2E Test Suite
**Complexity**: Advanced | **Est. Effort**: 20h | **Price**: Rp 8.000.000

- Admin smoke tests
- Public page verification
- Form interaction tests

### 4.2 Content Versioning System
**Complexity**: Advanced | **Est. Effort**: 12h | **Price**: Rp 5.000.000

- Draft/publish/archive lifecycle
- Revision history
- Content review workflow

---

## Summary

| Category | Features | Total Est. Hours | Total Price (IDR) |
|---|---|---|---|
| Public Website | 15 | 183h | Rp 75.000.000 |
| Admin CMS | 16 | 175h | Rp 71.000.000 |
| Technical | 10 | 107h | Rp 43.000.000 |
| QA & Automation | 2 | 32h | Rp 13.000.000 |
| **TOTAL** | **43** | **497h** | **Rp 202.000.000** |

---

## Pricing Bundles

### Starter — Rp 25.000.000
- Full public website (homepage, catalog, product detail, search)
- Basic admin (products, categories, brands)
- Authentication
- SEO
- Responsive design
- 1 month support

### Business — Rp 75.000.000
- Everything in Starter
- Homepage Builder CMS
- Project management
- Article/FAQ/Pages
- Navigation manager
- Media library
- Analytics
- Playwright test suite
- 3 months support

### Enterprise — Rp 150.000.000
- Everything in Business
- Content versioning & review workflow
- Appearance editor
- Quote request management
- Testimonials
- Bulk import/export
- Custom integrations
- Priority SLA
- 6 months support

---

## Highest-Value Modules

1. **Homepage Builder CMS** (Rp 20M) — Drag-drop section editor with versioning
2. **Product Management** (Rp 12M) — Full CRUD with draft/publish
3. **Product Catalog + Detail** (Rp 18M combined) — Core e-commerce flow
4. **Content Versioning** (Rp 5M) — Enterprise-grade publish workflow
5. **Playwright Automation** (Rp 8M) — QA infrastructure
