import { getPrisma } from '@/lib/db';
import { localizeRow, localizeRows } from '@/lib/i18n/server';

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

export class ProjectRepository {
  /** Public read - degrade to an empty list; a DB outage must not 500 a page. */
  async findPublic() {
    try {
      const prisma = await getPrisma();
      const rows = await prisma.project.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } });
      return localizeRows('projects', rows);
    } catch (e) {
      console.error('[public-read] projectRepo.findPublic failed:', (e as Error).message);      return [];
    }
  }
  async findAll() {
    const prisma = await getPrisma();
    return prisma.project.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  async findFeatured(limit = 6) {
    try {
      const prisma = await getPrisma();
      const rows = await prisma.project.findMany({ where: { published: true, featured: true }, orderBy: { sortOrder: 'asc' }, take: limit });
      return localizeRows('projects', rows);
    } catch (e) {
      console.error('ProjectRepository.findFeatured failed:', (e as Error).message);
      return [];
    }
  }
  async findBySlug(slug: string) {
    try {
      const prisma = await getPrisma();
      const row = await prisma.project.findUnique({ where: { slug, status: 'published' } });
      return row ? localizeRow('projects', row) : row;
    } catch (e) {
      console.error('ProjectRepository.findBySlug failed:', (e as Error).message);
      return undefined;
    }
  }
  async create(data: any) {
    const prisma = await getPrisma();
    // Auto-generate slug from title if not provided
    const slug = data.slug || toSlug(data.title);
    // Auto-assign sortOrder
    const maxOrder = await prisma.project.findFirst({ orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
    const sortOrder = (maxOrder?.sortOrder ?? -1) + 1;
    return prisma.project.create({ data: { ...data, slug, sortOrder } });
  }
  async update(id: string, data: any) { const prisma = await getPrisma(); return prisma.project.update({ where: { id }, data }); }
  async delete(id: string) {
    const prisma = await getPrisma();
    await prisma.review.deleteMany({ where: { entityType: 'project', entityId: id } });
    return prisma.project.delete({ where: { id } });
  }
  async publish(id: string) { const prisma = await getPrisma(); return prisma.project.update({ where: { id }, data: { published: true } }); }
  async unpublish(id: string) { const prisma = await getPrisma(); return prisma.project.update({ where: { id }, data: { published: false } }); }
  async count() { const prisma = await getPrisma(); return prisma.project.count(); }
}
export const projectRepo = new ProjectRepository();
