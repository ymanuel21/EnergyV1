'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';

// Returns categories in visual order: parents sorted by sortOrder, each parent
// immediately followed by its children (also sorted by sortOrder). Each parent
// row carries a sorted `children` array; child rows appear both in the flat list
// and under their parent. Any orphan (parentId set but parent missing) is
// appended last.
export async function getCategories() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const rows = await prisma.category.findMany();

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
    for (const k of kids) { ordered.push(k); emitted.add(k.id); }
  }
  // Orphans (parentId points at a missing parent) — append at the end.
  for (const r of rows) {
    if (!emitted.has(r.id)) ordered.push(r);
  }
  return ordered;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  parentId?: string | null;
  color?: string | null;
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
