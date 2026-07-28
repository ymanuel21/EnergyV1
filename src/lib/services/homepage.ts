import { safeWrite } from '@/lib/transaction';
import { homepageSectionSchema } from '@/lib/validations';
import { homepageRepo } from '@/lib/repositories/index';

export class HomepageService {
  async publish(sectionId: string) {
    const section = await homepageRepo.findAll().then(s => s.find((x: any) => x.id === sectionId));
    if (!section) throw new Error('Section not found');

    // Business rule: hero section must have a title
    if (section.type === 'hero' && !section.title) {
      throw new Error('Hero section requires a title before publishing');
    }

    return safeWrite({
      entityType: 'homepageSection',
      entityId: sectionId,
      entityName: section.title || section.type,
      action: 'update',
      data: { ...section, status: 'published', enabled: true },
      schema: homepageSectionSchema,
      execute: async (tx: any) => {
        return tx.homepageSection.update({
          where: { id: sectionId },
          data: { status: 'published', enabled: true },
        });
      },
    });
  }

  async unpublish(sectionId: string) {
    const section = await homepageRepo.findAll().then(s => s.find((x: any) => x.id === sectionId));
    if (!section) throw new Error('Section not found');

    return safeWrite({
      entityType: 'homepageSection',
      entityId: sectionId,
      entityName: section.title || section.type,
      action: 'update',
      data: { ...section, status: 'draft', enabled: false },
      schema: homepageSectionSchema,
      execute: async (tx: any) =>
        tx.homepageSection.update({ where: { id: sectionId }, data: { status: 'draft', enabled: false } }),
    });
  }

  async reorder(sectionId: string, direction: 'up' | 'down') {
    const sections = await homepageRepo.findAll();
    const idx = sections.findIndex((s: any) => s.id === sectionId);
    if (idx < 0) throw new Error('Section not found');
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const current = sections[idx];
    const target = sections[targetIdx];

    return safeWrite({
      entityType: 'homepageSection',
      entityId: sectionId,
      entityName: current.title || current.type,
      action: 'update',
      data: { sortOrder: target.sortOrder },
      schema: homepageSectionSchema,
      execute: async (tx: any) => {
        await tx.homepageSection.update({ where: { id: current.id }, data: { sortOrder: target.sortOrder } });
        await tx.homepageSection.update({ where: { id: target.id }, data: { sortOrder: current.sortOrder } });
      },
    });
  }

  async addSection(data: { type: string; title?: string; subtitle?: string; pageId?: string }) {
    return safeWrite({
      entityType: 'homepageSection',
      entityName: data.title || data.type,
      action: 'create',
      data: { ...data, enabled: false, status: 'draft', sortOrder: 0, settings: {} },
      schema: homepageSectionSchema,
      execute: async (tx: any) =>
        tx.homepageSection.create({ data: { ...data, enabled: false, status: 'draft', sortOrder: 0, settings: {} } }),
    });
  }

  async deleteSection(sectionId: string) {
    return safeWrite({
      entityType: 'homepageSection',
      entityId: sectionId,
      entityName: sectionId,
      action: 'delete',
      data: { id: sectionId },
      schema: homepageSectionSchema,
      execute: async (tx: any) => tx.homepageSection.delete({ where: { id: sectionId } }),
    });
  }
}

export const homepageService = new HomepageService();
