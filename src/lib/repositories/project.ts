import { getPrisma } from '@/lib/db';

export class ProjectRepository {
  async findPublic() {
    const prisma = await getPrisma();
    return prisma.project.findMany({ where: { published: true }, orderBy: { year: 'desc' } });
  }
  async findAll() {
    const prisma = await getPrisma();
    return prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
  }
  async findFeatured(limit = 6) {
    const prisma = await getPrisma();
    return prisma.project.findMany({ where: { published: true, featured: true }, orderBy: { year: 'desc' }, take: limit });
  }
  async findBySlug(slug: string) {
    const prisma = await getPrisma();
    return prisma.project.findUnique({ where: { slug, status: 'published' } });
  }
  async create(data: any) { const prisma = await getPrisma(); return prisma.project.create({ data }); }
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