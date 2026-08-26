import 'server-only';
import { getPrisma } from '@/lib/db';

// Returns categories in visual order: parents sorted by sortOrder, each parent
// immediately followed by its children (also sorted by sortOrder). Each parent
// carries a sorted `children` array; child rows also appear in the flat list so
// consumers that iterate the flat list (e.g. sitemap) still see every category.
// Children inherit their parent's color (resolved onto the child for convenience).
export async function getAllCategories(): Promise<any[]> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const rows = await prisma.category.findMany({ where: { isActive: true } });
      if (rows.length > 0) {
        const parents = rows.filter((c) => !c.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
        const childrenByParent = new Map<string, typeof rows>();
        for (const r of rows) {
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
        // Orphans (parentId set but parent missing) — append at the end.
        for (const r of rows) {
          if (!emitted.has(r.id)) ordered.push(r);
        }
        return ordered;
      }
    }
  } catch (e) { console.error('Prisma getAllCategories failed:', (e as Error).message); }
  return (await import('@/lib/data/categories')).categories as any[];
}

export async function getCategoryBySlug(slug: string): Promise<any> {
  try {
    if (process.env.DATABASE_URL) {
      const prisma = await getPrisma();
      const row = await prisma.category.findUnique({ where: { slug }, include: { children: true, parent: true } });
      if (row) return row;
    }
  } catch (e) { console.error('Prisma getCategoryBySlug failed:', (e as Error).message); }
  return (await import('@/lib/data/categories')).categories.find((c: any) => c.slug === slug);
}
