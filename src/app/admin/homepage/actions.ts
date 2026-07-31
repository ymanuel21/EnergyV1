'use server';

import { getAdminPrisma, requireAuth } from '../lib/admin-prisma';
import { revalidatePath } from 'next/cache';
import { safeWrite } from '@/lib/transaction';
import { homepageSectionSchema } from '@/lib/validations';
import { cache } from '@/lib/platform';

export async function getHomepageSections() {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const sections = await prisma.homepageSection.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { versions: { orderBy: { createdAt: 'desc' }, take: 2 } },
  });
  return sections.map(s => {
    const draft = s.versions.find((v: any) => v.status === 'draft');
    const pub = s.versions.find((v: any) => v.status === 'published');
    const active = draft || pub;
    return {
      ...s,
      title: active?.title || null,
      subtitle: active?.subtitle || null,
      settings: active?.settings || {},
      status: draft ? 'draft' : 'published',
      versions: undefined,
    };
  });
}

export async function saveDraft(data: {
  id: string; type: string; title: string; subtitle: string; sortOrder: number; settings: Record<string, unknown>;
}) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  return safeWrite({
    entityType: 'homepageSection',
    entityName: data.title || data.type,
    action: 'update',
    data: data as any,
    schema: homepageSectionSchema,
    execute: async (tx: any) => {
      // Update section metadata
      await tx.homepageSection.update({ where: { id: data.id }, data: { type: data.type, sortOrder: data.sortOrder } });

      // Upsert draft version
      const existing = await tx.homepageSectionVersion.findFirst({ where: { sectionId: data.id, status: 'draft' } });
      if (existing) {
        await tx.homepageSectionVersion.update({
          where: { id: existing.id },
          data: { title: data.title, subtitle: data.subtitle, settings: data.settings },
        });
      } else {
        await tx.homepageSectionVersion.create({
          data: { sectionId: data.id, status: 'draft', title: data.title, subtitle: data.subtitle, settings: data.settings },
        });
      }
    },
  });
}

export async function publishSection(id: string, data?: { type?: string; title?: string; subtitle?: string; settings?: Record<string, unknown> }) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  return safeWrite({
    entityType: 'homepageSection',
    entityId: id,
    entityName: data?.title || 'section',
    action: 'update' as const,
    data: data || {},
    schema: homepageSectionSchema,
    execute: async (tx: any) => {
      // Write latest settings to draft, then promote
      let draft = await tx.homepageSectionVersion.findFirst({ where: { sectionId: id, status: 'draft' } });
      if (!draft && data) {
        // No draft exists — create one from the publish payload
        draft = await tx.homepageSectionVersion.create({
          data: { sectionId: id, status: 'draft', title: data.title, subtitle: data.subtitle, settings: (data.settings || {}) as any },
        });
      }
      if (draft && data) {
        await tx.homepageSectionVersion.update({
          where: { id: draft.id },
          data: { title: data.title, subtitle: data.subtitle, settings: data.settings || {} },
        });
      }

      draft = await tx.homepageSectionVersion.findFirst({ where: { sectionId: id, status: 'draft' } });
      if (!draft) throw new Error('No draft to publish');

      // Archive old published
      const oldPublished = await tx.homepageSectionVersion.findFirst({ where: { sectionId: id, status: 'published' } });
      if (oldPublished) {
        await tx.revision.create({
          data: { entityType: 'homepage_section', entityId: id,
            data: { title: oldPublished.title, subtitle: oldPublished.subtitle, settings: oldPublished.settings, publishedAt: oldPublished.publishedAt },
          },
        });
        await tx.homepageSectionVersion.update({ where: { id: oldPublished.id }, data: { status: 'archived' } });
      }

      // Promote draft to published
      await tx.homepageSectionVersion.update({ where: { id: draft.id }, data: { status: 'published', publishedAt: new Date() } });
    },
  });
}

export async function upsertSection(data: {
  id?: string; type: string; enabled?: boolean; status?: string; sortOrder?: number; title?: string; subtitle?: string; settings?: Record<string, unknown>;
}) {
  await requireAuth();
  const prisma = await getAdminPrisma();

  if (data.id) {
    if (data.status === 'published') {
      // Publish atomically — save settings + promote in one transaction
      await publishSection(data.id, {
        type: data.type,
        title: data.title || '',
        subtitle: data.subtitle || '',
        settings: data.settings || {},
      });
      await prisma.homepageSection.update({ where: { id: data.id }, data: { enabled: data.enabled ?? true } });
    } else {
      await saveDraft({ id: data.id, type: data.type, title: data.title || '', subtitle: data.subtitle || '', sortOrder: data.sortOrder || 0, settings: data.settings || {} });
      if (data.enabled !== undefined) {
        await prisma.homepageSection.update({ where: { id: data.id }, data: { enabled: data.enabled } });
      }
    }
  } else {
    const section = await prisma.homepageSection.create({
      data: { type: data.type, enabled: data.enabled ?? false, sortOrder: data.sortOrder || 0 },
    });
    await prisma.homepageSectionVersion.create({
      data: { sectionId: section.id, status: 'draft', title: data.title || '', subtitle: data.subtitle || '', settings: (data.settings || {}) as any },
    });
  }

  revalidatePath('/admin/homepage');
  revalidatePath('/');
  cache.invalidate('nav:');
}

export async function deleteSection(id: string) {
  await requireAuth();
  const prisma = await getAdminPrisma();
  await prisma.homepageSectionVersion.deleteMany({ where: { sectionId: id } });
  await prisma.homepageSection.delete({ where: { id } });
  revalidatePath('/admin/homepage');
  revalidatePath('/');
}

export async function moveSection(id: string, direction: 'up' | 'down') {
  await requireAuth();
  const prisma = await getAdminPrisma();
  const sections = await prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
  const idx = sections.findIndex((s: any) => s.id === id);
  if (idx < 0) return;
  const target = direction === 'up' ? idx - 1 : idx + 1;
  if (target < 0 || target >= sections.length) return;
  const tmp = sections[idx].sortOrder;
  await prisma.homepageSection.update({ where: { id: sections[idx].id }, data: { sortOrder: sections[target].sortOrder } });
  await prisma.homepageSection.update({ where: { id: sections[target].id }, data: { sortOrder: tmp } });
  revalidatePath('/admin/homepage');
}
