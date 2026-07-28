# EBTPlaza Architecture

## Data Flow

```
Admin (Browser) → Server Action → Service Layer → Repository → Prisma → Database
                                    ↓
                              safeWrite Pipeline:
                              auth → validate → transaction → revision → activity log → revalidate
```

## Layers

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **UI** | Next.js pages and client components | `src/app/`, `src/components/` |
| **Server Actions** | Handle form submissions, call services | `src/app/admin/*/actions.ts` |
| **Service Layer** | Business rules, validation, orchestration | `src/lib/services/` |
| **Repository Layer** | Data access — the ONLY place Prisma is imported | `src/lib/repositories/` |
| **Database** | PostgreSQL via Prisma ORM | `prisma/` |

## Rules

### 1. Never import Prisma directly outside `src/lib/repositories/`

❌ Wrong:
```ts
const prisma = await getPrisma();
await prisma.product.create({ ... });
```

✅ Right:
```ts
import { productRepo } from '@/lib/repositories/product';
await productRepo.findAll();
```

### 2. Every write goes through `safeWrite()`

❌ Wrong:
```ts
await prisma.product.update({ where: { id }, data });
```

✅ Right:
```ts
await safeWrite({
  entityType: 'product',
  entityId: id,
  action: 'update',
  data,
  schema: productSchema,
  execute: (tx) => tx.product.update({ where: { id }, data }),
});
```

### 3. Every entity has one Zod schema

All validation schemas live in `src/lib/validations.ts`. Reuse them.

### 4. Every module registers in `moduleRegistry`

Adding a new admin page requires one entry:
```ts
moduleRegistry['newModule'] = {
  id: 'newModule', label: 'New Module', icon: '🆕',
  group: 'content', route: '/admin/new-module',
  description: '...', permission: '...', searchFields: [...],
};
```

### 5. Every homepage section registers in `sectionRegistry`

Adding a new section type requires one entry:
```ts
sectionRegistry['newType'] = {
  type: 'newType', label: 'New Type', icon: '🆕',
  defaultSettings: {}, fields: [...], Renderer: NewRenderer,
};
```

## Creating a New CMS Module

1. **Prisma**: Add model to `prisma/schema.prisma`
2. **Repository**: Create `src/lib/repositories/newModule.ts`
3. **Schema**: Add Zod validation to `src/lib/validations.ts`
4. **Service**: Create `src/lib/services/newModule.ts` (optional)
5. **Admin**: Create `src/app/admin/new-module/page.tsx`
6. **Actions**: Create `src/app/admin/new-module/actions.ts`
7. **Registry**: Register in `src/lib/module-registry.ts`
8. **Public page**: Create `src/app/new-route/page.tsx` (optional)
9. **Test**: Add `e2e/new-module.spec.ts`

## Theme System

CSS custom properties stored in `SiteSetting` table, injected by `ThemeProvider`:
- `--ebt-primary`, `--ebt-surface`, `--ebt-muted`, `--ebt-border`, `--ebt-accent`
- Updated via `/admin/appearance`

## Authentication

- NextAuth credentials provider
- `requireAuth()` in all server actions
- `requirePermission('action')` for role-based access
- Roles: owner, admin, editor, viewer

## Deployment

- `vercel --prod` for production
- Environment variables in Vercel dashboard
- Database: Neon PostgreSQL
