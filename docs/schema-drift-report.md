# Schema Drift Report — Local DB vs Prisma Models

**Date:** 2026-08-03
**DB:** Neon (via DATABASE_URL)

## StaticPage (table: `pages`)

| Column | Prisma | DB | Status |
|--------|--------|----|:-----:|
| id | String @id | id | ✅ |
| slug | String @unique | slug | ✅ |
| title | String | title | ✅ |
| content | String | content | ✅ |
| description | String? | description | ✅ (fixed with `prisma db push`) |
| updatedAt | DateTime @updatedAt | updated_at | ✅ |

**Status: SYNCED** — all columns present.

## SiteSetting (table: `settings`)

| Column | Prisma | DB | Status |
|--------|--------|-----|:-----:|
| key | String @id | key | ✅ |
| value | String | value | ✅ |

**Note:** Prisma generates `sitesetting` table (no @@map). But DB has `settings` table. The admin save uses `prisma.siteSetting.upsert()` which writes to `settings` table correctly (Prisma client maps correctly). The mismatch is in the generated SQL table name but Prisma handles the mapping at runtime. **No issue.**

## Testimonial

| Column | Prisma | DB | Status |
|--------|--------|-----|:-----:|
| status | String @default("draft") | status | ✅ |
| sortOrder | Int @default(0) | sortOrder | ✅ |
| published | ? | published | ✅ |
| All other fields | — | — | ✅ |

**Status: SYNCED.**

## HomepageSection / HomepageSectionVersion

Tables: `homepage_sections`, `homepage_section_versions` — both exist.

## Key Findings

1. **StaticPage.description** — Was missing on Vercel DB (fixed locally with `prisma db push`). Vercel DB still missing. **Compatibility code in actions.ts.**

2. **SiteSetting** — Table mapping diff (Prisma expects `sitesetting`, DB has `settings`). Works because Prisma maps correctly. **No issue.**

3. **All other tables** — Synced. No drift detected.

## Compatibility Code to Remove After Vercel Migration

**File: `src/app/admin/static-pages/actions.ts`**

Lines to delete:
```
  try {                                                    // line 9 — REMOVE
    return await prisma.staticPage.findMany({ ... });       // line 10 — KEEP
  } catch {                                                // line 11 — REMOVE
    // Fallback: description column may not exist...        // line 12 — REMOVE
    return (await import('@/lib/data/static-pages'))...     // lines 13-15 — REMOVE
  }                                                        // line 16 — REMOVE
```

And:
```
  try {                                                    // line 22 — REMOVE
    await prisma.staticPage.update({ where: { id }, data });// line 23 — KEEP
  } catch {                                                // line 24 — REMOVE
    // Strip description...                                 // line 25 — REMOVE
    const { description: _, ...safe } = data;               // line 26 — REMOVE
    await prisma.staticPage.update({ ... data: safe });     // line 27 — REMOVE
  }                                                        // line 28 — REMOVE
```

**After migration, the functions become simple one-liners:**
```ts
export async function getStaticPages() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.staticPage.findMany({ orderBy: { title: 'asc' } });
}

export async function updateStaticPage(id, data) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  await prisma.staticPage.update({ where: { id }, data });
  revalidatePath('/admin/static-pages');
  const page = await prisma.staticPage.findUnique({ where: { id }, select: { slug: true } });
  if (page?.slug) revalidatePath('/halaman/' + page.slug);
}
```

**Migration command:**
```
vercel env pull   # Get Vercel DATABASE_URL
DATABASE_URL=<vercel_url> npx prisma db push --accept-data-loss
```
