import { getPrisma } from '@/lib/db';

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

export class ProjectRepository {
  async findPublic() {
    const prisma = await getPrisma();
    return prisma.project.findMany({ where: { published: true }, orderBy: { sortOrder: 'asc' } });
  }
  async findAll() {
    const prisma = await getPrisma();
    return prisma.project.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  async findFeatured(limit = 6) {
    const prisma = await getPrisma();
    return prisma.project.findMany({ where: { published: true, featured: true }, orderBy: { sortOrder: 'asc' }, take: limit });
  }
  async findBySlug(slug: string) {
    const prisma = await getPrisma();
    return prisma.project.findUnique({ where: { slug, status: 'published' } });
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
