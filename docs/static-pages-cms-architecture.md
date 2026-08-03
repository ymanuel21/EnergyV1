# Static Pages CMS — Architecture Plan

## Current State

**Model:** `StaticPage` (Prisma) — 5 rows seeded, `id String @id`, no auto-generation
**DB Table:** `pages` (mapped)
**Public API:** `lib/api/static-pages.ts` — `getAllPages()`, `getPageBySlug()` (DB first, fallback to hardcoded)
**Public Route:** `/halaman/[slug]` — renders markdown content, ISR 3600s
**Admin:** NONE — no CRUD exists

## Architecture

### Files to Create (2 new)

```
src/app/admin/static-pages/
├── actions.ts         — getStaticPages(), updateStaticPage(), revalidate caches
└── page.tsx           — Server component: list + inline edit form per row
```

### Files to Modify (1)

```
src/lib/module-registry.ts  — Add { id: 'static-pages', label: 'Static Pages', ... }
```

### Reusable Components (already exist)

| Component | Used For | Source |
|-----------|----------|--------|
| `SlugInput` | Slug editing with auto-generation from title | `src/app/admin/SlugInput.tsx` |
| `revalidatePath` | Clear admin + public cache | `next/cache` (already imported) |
| `getAdminPrisma` | Auth'd database access | `src/app/admin/lib/admin-prisma.ts` |
| `<textarea>` | Markdown content editing (90% of the page) | Native HTML |

### Design

**User Flow:**

```
/admin/static-pages
  ├── Table: slug | title | updatedAt | [Edit] [Preview]
  └── Click Edit → inline form expands
       ├── Title:    <input>
       ├── Slug:     <SlugInput>
       ├── Content:  <textarea rows=20> (markdown)
       ├── SEO Desc: <input>
       └── [Save] [Cancel] [Preview →]
```

**Server Actions:**

```
actions.ts:
  getStaticPages()     → prisma.staticPage.findMany(orderBy: { title: 'asc' })
  updateStaticPage(id, data)  → prisma.staticPage.update({ where: { id }, data })
  revalidatePath('/admin/static-pages') — admin page
  revalidatePath('/halaman/' + slug)    — public page
```

**No Create/Delete needed:**

StaticPages are legal documents (Privacy, Terms, etc.). Creating/deleting them should be rare and can be done via DB. The admin should focus on editing existing pages. If needed later, create/delete can be added with one form + two server actions.

### Estimated Effort

- `actions.ts`: 20 lines (~10 min)
- `page.tsx`: 80 lines (~20 min) — list + inline form + save handler
- `module-registry.ts`: 10 lines (~2 min)
- Build + verify: (~30 min)

**Total: ~1 hour**

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| No `create` | Low | Add if needed; legal pages rarely created |
| No `delete` | Low | Can't accidentally delete legal pages |
| Markdown only (no WYSIWYG) | Low | Static pages are text-heavy; markdown sufficient |
| No draft/publish (model has no status) | Low | Content updates are immediate; ISR revalidation handles caching |

### Naming Clarity

After implementation:

```
/admin/pages          → Landing Pages (Homepage CMS pages)
/admin/static-pages   → Static Pages (About, Privacy, Terms)
```

Module registry already describes `/admin/pages` as "Halaman" — rename to "Landing Pages" to distinguish from "Static Pages".

### What's NOT included (by design)

- **WYSIWYG editor** — Out of scope. Markdown textarea is sufficient for legal/factual content.
- **Create/Delete** — StaticPages are legal documents. Can be added later if needed.
- **Version history** — Model has no `draftData` or `status` fields. Content changes are immediate.
- **Image upload** — Static pages are text-only. No media support needed.

---

## Recommendation: IMPLEMENT

Small scope, low risk, high value. 1-hour build. Solves the "marketing team can't edit" problem.
