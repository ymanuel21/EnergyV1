'use server';

import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';
import { auth } from '@/lib/auth';

type EntityType = 'product' | 'project' | 'testimonial';

const APPROVER_ROLES = ['owner', 'admin'];

function requireApprover(role: string) {
  if (!APPROVER_ROLES.includes(role)) {
    throw new Error('Forbidden: only owner/admin can approve or reject reviews');
  }
}

async function getSession(): Promise<{ name?: string | null; role: string }> {
  const session = await auth();
  return {
    name: session?.user?.name,
    role: ((session?.user as any)?.role) || 'admin',
  };
}

/**
 * Submit an entity for review. Only editors+ can submit.
 * Creates a pending Review and returns it.
 */
export async function submitForReview(entityType: EntityType, entityId: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const session = await auth();
  const userName = session?.user?.name || 'Unknown';

  // Verify entity exists and is in draft status
  let entity: any;
  if (entityType === 'product') {
    entity = await prisma.product.findUnique({ where: { id: entityId } });
  } else if (entityType === 'project') {
    entity = await prisma.project.findUnique({ where: { id: entityId } });
  } else {
    entity = await prisma.testimonial.findUnique({ where: { id: entityId } });
  }

  if (!entity) throw new Error(`${entityType} not found`);
  if (entity.status !== 'draft') throw new Error(`Cannot submit — ${entityType} status is '${entity.status}', expected 'draft'`);

  // Create pending review
  const review = await prisma.review.create({
    data: {
      entityType,
      entityId,
      status: 'pending',
      requestedBy: userName,
    },
  });

  // Update entity status to 'review'
  if (entityType === 'product') {
    await prisma.product.update({ where: { id: entityId }, data: { status: 'review' } });
  } else if (entityType === 'project') {
    await prisma.project.update({ where: { id: entityId }, data: { status: 'review' } });
  } else {
    await prisma.testimonial.update({ where: { id: entityId }, data: { status: 'review' } });
  }

  return review;
}

/**
 * Approve a pending review. Only owner/admin.
 * Does NOT publish — just marks review as approved.
 */
export async function approveReview(reviewId: string) {
  await requireAuth();
  const { name, role } = await getSession();
  requireApprover(role);

  const prisma = await getAdminPrisma();
  const reviewerName = name || 'Unknown';

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error('Review not found');
  if (review.status !== 'pending') throw new Error(`Review is already ${review.status}`);

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: 'approved',
      reviewedBy: reviewerName,
      reviewedAt: new Date(),
    },
  });

  return updated;
}

/**
 * Reject a pending review with a reason. Only owner/admin.
 * Returns entity to draft state so editor can modify.
 */
export async function rejectReview(reviewId: string, reason: string) {
  await requireAuth();
  const { name, role } = await getSession();
  requireApprover(role);

  const prisma = await getAdminPrisma();
  const reviewerName = name || 'Unknown';

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error('Review not found');
  if (review.status !== 'pending') throw new Error(`Review is already ${review.status}`);

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: 'rejected',
      reviewedBy: reviewerName,
      notes: reason,
      reviewedAt: new Date(),
    },
  });

  // Return entity to draft state
  if (review.entityType === 'product') {
    await prisma.product.update({ where: { id: review.entityId }, data: { status: 'draft' } });
  } else if (review.entityType === 'project') {
    await prisma.project.update({ where: { id: review.entityId }, data: { status: 'draft' } });
  } else {
    await prisma.testimonial.update({ where: { id: review.entityId }, data: { status: 'draft' } });
  }

  return updated;
}

/**
 * Get the latest review for an entity (any status).
 */
export async function getLatestReview(entityType: EntityType, entityId: string) {
  const prisma = await getAdminPrisma();
  return prisma.review.findFirst({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get review queue — reviews with entity details, filterable.
 */
export async function getReviewQueue(filters?: { entityType?: EntityType | 'all'; status?: string }) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  const where: any = {};
  if (filters?.entityType && filters.entityType !== 'all') {
    where.entityType = filters.entityType;
  }
  if (filters?.status && filters.status !== 'all') {
    where.status = filters.status;
  }

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { requestedAt: 'desc' },
  });

  // Batch entity lookups — avoid N+1 queries
  const productIds = reviews.filter(r => r.entityType === 'product').map(r => r.entityId);
  const projectIds = reviews.filter(r => r.entityType === 'project').map(r => r.entityId);
  const testimonialIds = reviews.filter(r => r.entityType === 'testimonial').map(r => r.entityId);

  const [products, projects, testimonials] = await Promise.all([
    productIds.length > 0
      ? prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true, status: true } })
      : [],
    projectIds.length > 0
      ? prisma.project.findMany({ where: { id: { in: projectIds } }, select: { id: true, title: true, slug: true, status: true } })
      : [],
    testimonialIds.length > 0
      ? prisma.testimonial.findMany({ where: { id: { in: testimonialIds } }, select: { id: true, name: true } })
      : [],
  ]);

  const productMap = new Map(products.map(p => [p.id, p.name]));
  const projectMap = new Map(projects.map(p => [p.id, (p as any).title]));
  const testimonialMap = new Map(testimonials.map(t => [t.id, t.name]));

  const enriched = reviews.map(r => ({
    ...r,
    entityName: r.entityType === 'product'
      ? productMap.get(r.entityId) || 'Unknown'
      : r.entityType === 'project'
      ? projectMap.get(r.entityId) || 'Unknown'
      : testimonialMap.get(r.entityId) || 'Unknown',
  }));

  return enriched;
}
