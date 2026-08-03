# Banners CMS — Full Audit Report

Date: 2026-08-02
Auditor: Automated QA
Target: https://energyv1.vercel.app/admin/banners

---

## 1. DATA MODEL

### Prisma Schema (`prisma/schema.prisma`)

```prisma
model Banner {
  id          String  @id
  type        String  @default("hero")      // "hero" | "need-card"
  title       String?                       // Admin label
  src         String?                       // Legacy image URL (NOT used)
  image       String?                       // Current image URL
  alt         String?                       // Alt text
  link        String?                       // Click destination
  label       String?                       // CTA button text (NOT used)
  description String?                       // Subtitle text (NOT used)
  isActive    Boolean @default(true)        // Visibility toggle
  sortOrder   Int     @default(0)           // Display order

  @@map("banners")
}
```

### Field Usage Matrix

| Field       | Admin Write | Admin Read | Public Read | Status |
|-------------|:-----------:|:----------:|:-----------:|:------:|
| id          | ✅ auto     | ✅         | —           | active |
| type        | ✅          | ✅ display | ❌          | DEAD   |
| title       | ✅          | ✅         | ❌          | admin  |
| src         | ❌          | ❌         | ✅ fallback | legacy |
| image       | ✅          | ✅         | ✅          | active |
| alt         | ✅          | ✅         | ✅          | active |
| link        | ✅          | ✅         | ❌          | DEAD   |
| label       | ❌          | ❌         | ❌          | DEAD   |
| description | ❌          | ❌         | ❌          | DEAD   |
| isActive    | ❌ no toggle | ✅ query   | ✅ query    | active |
| sortOrder   | ✅          | ✅         | ✅ orderBy  | active |

**6 of 11 fields are dead code** — written to DB but never read by any public component.

---

## 2. ADMIN CMS

### Files

```
src/app/admin/banners/
  page.tsx      — Server component, inline server actions
  actions.ts    — CRUD wrappers with requireAuth()
```

### Capabilities

| Action | Status | Implementation |
|--------|:------:|---------------|
| Create | ✅     | `createBanner({ id: 'banner-{ts}', ... })` |
| Read   | ✅     | `getBanners()` → all banners |
| Update | ✅     | `updateBanner(id, { title, image, link, alt })` |
| Delete | ✅     | `deleteBanner(id)` |
| Publish/Draft | ❌  | No content-versioning. Banner goes live instantly. |
| Toggle Active | ❌  | `isActive` has no admin toggle. Must be set to true at creation or via DB. |

### Form Fields

| Form Field | Mapped to DB column | Notes |
|-----------|---------------------|-------|
| `title` placeholder "Judul" | `title` | Required on create |
| `type` select (hero/need-card) | `type` | Written but never used by public renderer |
| `image` (ImageUpload) | `image` | Only field with visual impact |
| `link` placeholder "Link" | `link` | Written but never used |
| `alt` placeholder "Alt text" | `alt` | Used by hero renderer |
| `sortOrder` number | `sortOrder` | Used for ordering |

### Missing from Admin

- No `isActive` toggle (banners cannot be deactivated from UI)
- No `label` field (CTA text)
- No `description` field (subtitle)
- No `src` field (legacy fallback — ignored)
- No preview of how the banner looks on the homepage

---

## 3. PUBLIC CONSUMERS

### Direct Consumers

**`getPublicBanners()`** (`src/lib/api/banners.ts`)
→ Queries `WHERE isActive = true ORDER BY sortOrder ASC`
→ Called from:

| File | Usage |
|------|-------|
| `src/app/page.tsx:25` | Homepage — passes to section renderers |
| `src/app/[slug]/page.tsx:38` | Static landing pages — passes to section renderers |

### Renderer

**`src/lib/section-registry.tsx`** — Hero section (lines 300–326):

```tsx
const banner = data?.banners?.[0];                              // line 300
const heroImage = heroProduct?.images?.[0]                       // line 304
  || banner?.image                                              // ← banner fallback #1
  || banner?.src                                                // ← banner fallback #2
  || '/images/prototype/hero-power-station.png';                // ← hardcoded fallback
// ...
<img src={heroImage} alt={banner?.alt || 'Hero'} />              // line 326
```

**Priority chain:**
1. Product image (from featured/hero product)
2. Section settings `imageId` (Homepage CMS)
3. Banner `image` (Banners CMS) ← **THE ONLY PUBLIC CONSUMPTION PATH**
4. Banner `src` (legacy field)
5. Hardcoded prototype placeholder

Banners are a **4th priority fallback**. If the Homepage CMS Hero section has an image, banners are never shown.

### NOT Used By

- Navigation — no banner integration
- Promotions — no banner section
- Property cards — no banner overlay
- Footer — no banner reference
- Mobile nav — no banner integration
- Any other section type (Categories, Products, Brands, Testimonials, CTA)

---

## 4. ORPHANED CODE

### `src/lib/data/banners.ts`

Contains hardcoded:
- 1 `banner` object (hero SVG)
- 3 `needCards` objects

**Imported by:** NOTHING. Zero imports in the entire codebase.

This file was the PREVIOUS hardcoded implementation. It has been fully replaced by the database-driven system but was never removed.

---

## 5. HOMEPAGE CMS OVERLAP

The Homepage CMS (`/admin/homepage`) has a Hero section type (`section-registry.tsx:288-328`) that:
- Has its own `settings.imageId` — a primary image upload
- Has its own `settings.title`, `settings.description`, `settings.buttonLabel`, `settings.buttonLink`
- Has its own `settings.backgroundImage`, `settings.featuredProductId`

The Banner CMS provides:
- `image` (image URL)
- `alt` (alt text)
- `link` (button destination — NOT read)
- `title` (NOT read)
- `description` (NOT read)

**Duplicate functionality:** Hero image, button, subtitle. Homepage CMS does all of this better AND has product linking.

**Unique Banner CMS features:** None. Everything can be done in Homepage CMS.

---

## 6. RECOMMENDATION

### Verdict: **DEPRECATE**

The Banners CMS is a legacy system that:
- Is only used as a 4th-priority image fallback
- Has 6 unused fields
- Is fully replaced by Homepage CMS Hero section
- Has orphaned hardcoded data file
- Has no scheduled/published workflow
- Cannot be deactivated from admin UI
- Is confusing to editors (two ways to set a hero image)

### Migration Path

1. Remove `data?.banners?.[0]` fallback from `section-registry.tsx:304`
   → Replace with Homepage CMS `settings.imageId` (already the priority)
2. Delete `src/lib/data/banners.ts` (orphaned)
3. Delete `src/app/admin/banners/` (admin pages)
4. Delete `src/lib/api/banners.ts` (API)
5. Delete `bannerRepo` from `src/lib/repositories/index.ts`
6. Delete Banner model from `prisma/schema.prisma`
7. Run `prisma db push` to drop `banners` table

### Before Deprecating

Verify no Vercel production banners are actively used as hero images. Check `/admin/banners` for any records with valid images. If none, safe to remove.
