'use server';

import { getAdminPrisma, requireAuth } from '@/app/admin/lib/admin-prisma';

// Default role-based permission sets
const ROLE_PERMISSIONS: Record<string, string[]> = {
  owner: ['*'],
  admin: ['manage_products', 'manage_categories', 'manage_brands', 'manage_banners',
    'manage_articles', 'manage_faq', 'manage_pages', 'manage_homepage', 'manage_navigation',
    'manage_media', 'manage_quotes', 'manage_testimonials', 'manage_projects',
    'publish_content', 'delete_content'],
  editor: ['manage_products', 'manage_categories', 'manage_brands',
    'manage_articles', 'manage_faq', 'manage_pages', 'manage_testimonials', 'manage_projects'],
  viewer: [],
};

export async function requirePermission(permission: string) {
  const session = await requireAuth();
  const email = session?.user?.email;
  if (!email) throw new Error('Unauthorized');

  const prisma = await getAdminPrisma();
  let user = await prisma.adminUser.findUnique({ where: { email } });

  // Auto-create first user as owner
  if (!user) {
    user = await prisma.adminUser.create({
      data: { email, name: email.split('@')[0], role: 'owner' },
    });
  }

  const rolePerms = ROLE_PERMISSIONS[user.role] || [];
  const explicitPerms = (user.permissions as string[]) || [];
  const allPerms = [...rolePerms, ...explicitPerms];

  if (allPerms.includes('*')) return session;
  if (!allPerms.includes(permission)) throw new Error(`Permission denied: ${permission}`);

  return session;
}

export async function saveRevision(entityType: string, entityId: string, data: any, userId?: string, userName?: string) {
  try {
    const prisma = await getAdminPrisma();
    await prisma.revision.create({
      data: { entityType, entityId, data: JSON.parse(JSON.stringify(data)), userId: userId || '', userName: userName || '' },
    });
  } catch {}
}

export async function getRevisions(entityType: string, entityId: string) {
  const prisma = await getAdminPrisma();
  return prisma.revision.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function logActivity(action: string, entity: string, entityName?: string, details?: string, userId?: string, userName?: string) {
  try {
    const prisma = await getAdminPrisma();
    await prisma.activityLog.create({
      data: { action, entity, entityName: entityName || '', details: details || '', userId: userId || '', userName: userName || '' },
    });
  } catch {}
}

export async function getActivityLog(take = 50) {
  const prisma = await getAdminPrisma();
  return prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take });
}
