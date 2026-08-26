'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

// Returns categories in visual order: parents sorted by sortOrder, each parent
// immediately followed by its children (also sorted by sortOrder). Each parent
// row carries a sorted `children` array; child rows appear both in the flat list
// and under their parent. Any orphan (parentId set but parent missing) is
// appended last.
//
// Admin sees ALL categories (including hidden ones).  Each row gets:
//   isVisible         — the category's own stored visibility
//   effectiveVisible  — computed: isVisible AND every ancestor.isVisible
export async function getCategories() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const rows = await prisma.category.findMany();

  // Build lookup map for ancestor traversal.
  const byId = new Map(rows.map((c) => [c.id, c]));

  // Compute effective visibility for each row.
  function effectiveVisible(cat: (typeof rows)[0]): boolean {
    if (!cat.isVisible) return false;
    let cur = cat;
    while (cur.parentId) {
      const parent = byId.get(cur.parentId);
      if (!parent) break;
      if (!parent.isVisible) return false;
      cur = parent;
    }
    return true;
  }

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
    ordered.push({ ...p, children: kids, effectiveVisible: effectiveVisible(p) });
    emitted.add(p.id);
    for (const k of kids) {
      ordered.push({ ...k, effectiveVisible: effectiveVisible(k) });
      emitted.add(k.id);
    }
  }
  // Orphans (parentId points at a missing parent) — append at the end.
  for (const r of rows) {
    if (!emitted.has(r.id)) ordered.push({ ...r, effectiveVisible: effectiveVisible(r) });
  }
  return ordered;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  parentId?: string | null;
  color?: string | null;
  showGradient?: boolean;
  gradientColor?: string | null;
  gradientHeight?: number | null;
}) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.create({
    data: {
      id: `cat-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      parentId: data.parentId || null,
      color: data.color || null,
      showGradient: data.showGradient ?? false,
      gradientColor: data.gradientColor || null,
      gradientHeight: data.gradientHeight ?? null,
    },
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    parentId?: string | null;
    color?: string | null;
    showGradient?: boolean;
    gradientColor?: string | null;
    gradientHeight?: number | null;
  }
) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
      ...(data.showGradient !== undefined ? { showGradient: data.showGradient } : {}),
      ...(data.gradientColor !== undefined ? { gradientColor: data.gradientColor } : {}),
      ...(data.gradientHeight !== undefined ? { gradientHeight: data.gradientHeight } : {}),
      parentId: data.parentId === '' ? null : data.parentId === undefined ? undefined : data.parentId,
    },
  });
}

// Toggle a category's own isVisible field.  Does NOT cascade to children —
// effective visibility is computed from the hierarchy at query time.
export async function toggleCategoryVisibility(id: string, isVisible: boolean) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  return prisma.category.update({
    where: { id },
    data: { isVisible },
  });
}

export async function getCategoryUsage(categoryId: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const productCount = await prisma.productCategory.count({ where: { categoryId } });
  return { productCount };
}

export async function deleteCategory(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const usage = await prisma.productCategory.count({ where: { categoryId: id } });
  if (usage > 0) {
    throw new Error(`Category is currently used by ${usage} product${usage > 1 ? 's' : ''}.`);
  }
  await prisma.category.updateMany({ where: { parentId: id }, data: { parentId: null } });
  return prisma.category.delete({ where: { id } });
}
