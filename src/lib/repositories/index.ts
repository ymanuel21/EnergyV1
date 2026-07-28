import { getPrisma } from '@/lib/db';

export class CategoryRepository {
  async findAll(isActive?: boolean) {
    const prisma = await getPrisma();
    return prisma.category.findMany({
      where: isActive !== undefined ? { isActive } : {},
      orderBy: { sortOrder: 'asc' },
      include: { children: true },
    });
  }

  async findBySlug(slug: string) {
    const prisma = await getPrisma();
    return prisma.category.findUnique({ where: { slug }, include: { children: true, parent: true } });
  }

  async getProductCount(categoryId: string) {
    const prisma = await getPrisma();
    return prisma.productCategory.count({ where: { categoryId } });
  }
}

export const categoryRepo = new CategoryRepository();

// Banner
export class BannerRepository {
  async findPublic() {
    const prisma = await getPrisma();
    return prisma.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }
  async findAll() {
    const prisma = await getPrisma();
    return prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  async create(data: any) { const prisma = await getPrisma(); return prisma.banner.create({ data }); }
  async update(id: string, data: any) { const prisma = await getPrisma(); return prisma.banner.update({ where: { id }, data }); }
  async delete(id: string) { const prisma = await getPrisma(); return prisma.banner.delete({ where: { id } }); }
}
export const bannerRepo = new BannerRepository();

// Homepage Sections
export class HomepageRepository {
  async findPublic(pageId?: string) {
    const prisma = await getPrisma();
    const where: any = { enabled: true, status: 'published' };
    if (pageId) where.pageId = pageId; else where.pageId = null;
    return prisma.homepageSection.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }
  async findAll() {
    const prisma = await getPrisma();
    return prisma.homepageSection.findMany({ orderBy: { sortOrder: 'asc' } });
  }
  async findByPage(pageId: string) {
    const prisma = await getPrisma();
    return prisma.homepageSection.findMany({ where: { pageId }, orderBy: { sortOrder: 'asc' } });
  }
  async create(data: any) { const prisma = await getPrisma(); return prisma.homepageSection.create({ data }); }
  async update(id: string, data: any) { const prisma = await getPrisma(); return prisma.homepageSection.update({ where: { id }, data }); }
  async delete(id: string) { const prisma = await getPrisma(); return prisma.homepageSection.delete({ where: { id } }); }
}
export const homepageRepo = new HomepageRepository();

// Navigation
export class NavigationRepository {
  async findPublic() {
    const prisma = await getPrisma();
    const rows = await prisma.navigationLink.findMany({ where: { enabled: true }, orderBy: { sortOrder: 'asc' } });
    const map: Record<string, { label: string; href: string }[]> = {};
    for (const r of rows) { if (!map[r.group]) map[r.group] = []; map[r.group].push({ label: r.label, href: r.href }); }
    return map;
  }
  async findAll() { const prisma = await getPrisma(); return prisma.navigationLink.findMany({ orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }] }); }
  async create(data: any) { const prisma = await getPrisma(); return prisma.navigationLink.create({ data }); }
  async update(id: string, data: any) { const prisma = await getPrisma(); return prisma.navigationLink.update({ where: { id }, data }); }
  async delete(id: string) { const prisma = await getPrisma(); return prisma.navigationLink.delete({ where: { id } }); }
}
export const navigationRepo = new NavigationRepository();

// Projects
export class ProjectRepository {
  async findPublic() { const prisma = await getPrisma(); return prisma.project.findMany({ where: { published: true }, orderBy: { year: 'desc' } }); }
  async findAll() { const prisma = await getPrisma(); return prisma.project.findMany({ orderBy: { createdAt: 'desc' } }); }
  async create(data: any) { const prisma = await getPrisma(); return prisma.project.create({ data }); }
  async publish(id: string) { const prisma = await getPrisma(); return prisma.project.update({ where: { id }, data: { published: true } }); }
}
export const projectRepo = new ProjectRepository();

// Testimonials
export class TestimonialRepository {
  async findPublic() { const prisma = await getPrisma(); return prisma.testimonial.findMany({ where: { published: true }, orderBy: { createdAt: 'desc' } }); }
  async findAll() { const prisma = await getPrisma(); return prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } }); }
  async create(data: any) { const prisma = await getPrisma(); return prisma.testimonial.create({ data }); }
}
export const testimonialRepo = new TestimonialRepository();

// Articles
export class ArticleRepository {
  async findAll() { const prisma = await getPrisma(); return prisma.article.findMany({ orderBy: { createdAt: 'desc' } }); }
  async findBySlug(slug: string) { const prisma = await getPrisma(); return prisma.article.findUnique({ where: { slug } }); }
}
export const articleRepo = new ArticleRepository();

// Media / Assets
export class MediaRepository {
  async findAll(search?: string) {
    const prisma = await getPrisma();
    return prisma.asset.findMany({ where: search ? { filename: { contains: search } } : {}, orderBy: { createdAt: 'desc' }, take: 50 });
  }
  async delete(id: string) { const prisma = await getPrisma(); return prisma.asset.delete({ where: { id } }); }
  async count() { const prisma = await getPrisma(); return prisma.asset.count(); }
}
export const mediaRepo = new MediaRepository();
