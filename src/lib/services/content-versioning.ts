'use server';

import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';

export type ContentEntity = 'product' | 'project' | 'testimonial';

interface SaveDraftInput {
  entity: ContentEntity;
  id: string;
  data: Record<string, any>;
}

interface PublishInput {
  entity: ContentEntity;
  id: string;
}

/**
 * Save draft — store changes in draftData JSON without affecting the live version.
 */
export async function saveDraft({ entity, id, data }: SaveDraftInput) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  if (entity === 'product') {
    await prisma.product.update({ where: { id }, data: { status: 'draft', draftData: data } });
  } else if (entity === 'project') {
    await prisma.project.update({ where: { id }, data: { status: 'draft', draftData: data } });
  } else {
    await prisma.testimonial.update({ where: { id }, data: { status: 'draft', draftData: data } });
  }
}

/**
 * Publish — copy draftData to main fields, set status=published, archive old published.
 */
export async function publishEntity({ entity, id }: PublishInput) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  if (entity === 'product') {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('Not found');

    const draft = product.draftData as any;
    if (!draft || Object.keys(draft).length === 0) {
      // No draft — just set the current state to published
      await prisma.product.update({ where: { id }, data: { status: 'published', draftData: {} } });
      return;
    }

    // Strip UI-only / non-column keys before sending to Prisma.
    // categoryIds/badgeIds/relations are persisted to their own tables below;
    // seoTitle/metaDescription have no Product column; publishedAt is not a column.
    const { categoryIds, badgeIds, relations, seoTitle, metaDescription, ...productData } = draft;

    // Apply draft data to main Product fields (columns only)
    await prisma.product.update({
      where: { id },
      data: {
        ...productData,
        status: 'published',
        draftData: {},
        isActive: true,
      },
    });

    // Persist category links
    if (Array.isArray(categoryIds)) {
      await prisma.productCategory.deleteMany({ where: { productId: id } });
      if (categoryIds.length) {
        await prisma.productCategory.createMany({
          data: categoryIds.map((catId: string) => ({ productId: id, categoryId: catId })),
        });
      }
    }

    // Persist badge links
    if (Array.isArray(badgeIds)) {
      await prisma.productBadge.deleteMany({ where: { productId: id } });
      if (badgeIds.length) {
        await prisma.productBadge.createMany({
          data: badgeIds.map((badgeId: string) => ({ productId: id, badgeId })),
        });
      }
    }

    // Persist related-product links
    if (Array.isArray(relations)) {
      await prisma.productRelation.deleteMany({ where: { productId: id } });
      if (relations.length) {
        await prisma.productRelation.createMany({
          data: relations.map((r: any) => ({ productId: id, relatedProductId: r.relatedProductId, type: r.type })),
        });
      }
    }
  } else if (entity === 'project') {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new Error('Not found');

    const draft = project.draftData as any;
    if (!draft || Object.keys(draft).length === 0) {
      await prisma.project.update({ where: { id }, data: { status: 'published', draftData: {}, published: true } });
      return;
    }

    await prisma.project.update({
      where: { id },
      data: {
        ...draft,
        status: 'published',
        published: true,
        draftData: {},
      },
    });
  } else {
    // testimonial
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new Error('Not found');

    const draft = testimonial.draftData as any;
    if (!draft || Object.keys(draft).length === 0) {
      await prisma.testimonial.update({ where: { id }, data: { status: 'published', draftData: {}, published: true } });
      return;
    }

    await prisma.testimonial.update({
      where: { id },
      data: {
        ...draft,
        status: 'published',
        published: true,
        draftData: {},
      },
    });
  }
}

/**
 * Archive — soft-delete by setting status=archived, isActive=false.
 */
export async function archiveEntity({ entity, id }: { entity: ContentEntity; id: string }) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  if (entity === 'product') {
    await prisma.product.update({ where: { id }, data: { status: 'archived', isActive: false } });
  } else if (entity === 'project') {
    await prisma.project.update({ where: { id }, data: { status: 'archived', published: false } });
  } else {
    await prisma.testimonial.update({ where: { id }, data: { status: 'archived', published: false } });
  }
}
