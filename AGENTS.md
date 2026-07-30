<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-architecture-rules -->
## ARCHITECTURE RULE — pg.Pool imports

**RULE**: Admin pages MUST NOT import modules that transitively import `pg.Pool` at the TOP LEVEL.

**Violation chain**:
```
admin page → @/lib/repositories/project → @/lib/db → pg.Pool (crash)
admin page → @/lib/services/content-versioning → admin-prisma → pg.Pool (crash)
```

**Safe**: Direct import of `getAdminPrisma` (single chain, Next.js handles it).
**Safe**: `await import()` inside server actions (lazy, after page render).

**Why**: On Vercel serverless, duplicate import chains to `pg` cause module initialization conflicts during static bundling of server components.

**Fix pattern**: Replace top-level imports with dynamic `await import()` inside server actions:
```ts
// ❌ CRASHES
import { projectRepo } from '@/lib/repositories/project';

// ✅ WORKS
async function deleteProject(formData: FormData) {
  'use server';
  const { projectRepo } = await import('@/lib/repositories/project');
  ...
}
```

**Guard script**: `npx tsx scripts/check-pg-pool-imports.ts`
Run before commit to detect violations.

**Proof**: Deploy with `import { projectRepo }` → 500 on Vercel. Same deploy without → 200.
<!-- END:project-architecture-rules -->
