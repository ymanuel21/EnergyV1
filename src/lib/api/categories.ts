import 'server-only';
import { getPrisma } from '@/lib/db';

// Compute effective visibility for a category: the category's own isVisible
// AND every ancestor's isVisible.  Returns false if any ancestor is hidden.
function computeEffectiveVisible(
  cat: { isVisible: boolean; parentId: string | null },
  byId: Map<string, { isVisible: boolean; parentId: string | null }>
): boolean {
  if (!cat.isVisible) return false;
  let cur = cat;
  while (cur.parentId) {
    const parent = byId.get(cur.parentId);
    if (!parent) break; // orphan — treat as visible (no parent to inherit from)
    if (!parent.isVisible) return false;
    cur = parent;
  }
  return true;
}

// Returns categories in visual order: parents sorted by sortOrder, each parent
// immediately followed by its children (also sorted by sortOrder). Each parent
// carries a sorted `children` array; child rows also appear in the flat list so
// consumers that iterate the flat list (e.g. sitemap) still see every category.
// Children inherit their parent's color (resolved onto the child for convenience).
//
// Only categories whose EFFECTIVE visibility is true are returned.
export async function getAllCategories(): Promise<any[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.category.findMany({
        where: { isActive: true, isVisible: true },
      });
      if (rows.length > 0) {
        // Build a lookup map for ancestor traversal.
        const byId = new Map(rows.map((c) => [c.id, c]));

        // Filter to only effectively-visible categories.
        // A category is effectively visible only if it AND every ancestor is visible.
        const effective = rows.filter((c) => {
          if (!c.isVisible) return false;
          let cur: typeof c = c;
          while (cur.parentId) {
            const parent = byId.get(cur.parentId);
            if (!parent) break;
            if (!parent.isVisible) return false;
            cur = parent;
          }
          return true;
        });

        if (effective.length === 0) return [];

        const parents = effective
          .filter((c) => !c.parentId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        const childrenByParent = new Map<string, typeof effective>();
        for (const r of effective) {
          if (!r.parentId) continue;
          if (!childrenByParent.has(r.parentId)) childrenByParent.set(r.parentId, []);
          childrenByParent.get(r.parentId)!.push(r);
        }
        for (const kids of childrenByParent.values()) kids.sort((a, b) => a.sortOrder - b.sortOrder);

        const ordered: any[] = [];
        const emitted = new Set<string>();
        for (const p of parents) {
          const kids = childrenByParent.get(p.id) ?? [];
          ordered.push({ ...p, children: kids });
          emitted.add(p.id);
          for (const k of kids) {
            // Children visually inherit their parent's color.
            ordered.push({ ...k, color: p.color ?? k.color, children: [] });
            emitted.add(k.id);
          }
        }
        // Orphans (parentId points at a missing parent) — append at the end.
        for (const r of effective) {
          if (!emitted.has(r.id)) ordered.push(r);
        }
        return ordered;
      }
    }
  } catch (e) { console.error('Prisma getAllCategories failed:', (e as Error).message); }
  return (await import('@/lib/data/categories')).categories as any[];
}

// Fetch a single category by slug.  Returns null if the category does not exist,
// is inactive, or is effectively hidden (itself or any ancestor has isVisible=false).
export async function getCategoryBySlug(slug: string): Promise<any> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const row = await prisma.category.findUnique({
        where: { slug },
        include: { children: true, parent: true },
      });
      if (!row) return null;
      if (!row.isActive || !row.isVisible) return null;

      // Walk up the ancestor chain to verify effective visibility.
      let cur: any = row;
      while (cur.parentId) {
        const ancestor = await prisma.category.findUnique({
          where: { id: cur.parentId },
          select: { id: true, isVisible: true, isActive: true, parentId: true },
        });
        if (!ancestor) break;
        if (!ancestor.isActive || !ancestor.isVisible) return null;
        cur = ancestor;
      }

      return row;
    }
  } catch (e) { console.error('Prisma getCategoryBySlug failed:', (e as Error).message); }
  return (await import('@/lib/data/categories')).categories.find((c: any) => c.slug === slug);
}
