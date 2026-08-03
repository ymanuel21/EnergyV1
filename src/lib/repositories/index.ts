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

// Homepage Sections
export class HomepageRepository {
  async findPublic(pageId?: string) {
    const prisma = await getPrisma();
    const where: any = { enabled: true };
    if (pageId) where.pageId = pageId; else where.pageId = null;
    const sections = await prisma.homepageSection.findMany({
      where, orderBy: { sortOrder: 'asc' },
      include: { versions: { where: { status: 'published' }, take: 1 } },
    });
    return sections.map((s: any) => { const v = s.versions?.[0]; return { ...s, title: v?.title, subtitle: v?.subtitle, settings: v?.settings || {} }; });
  }
  async findAll() {
    const prisma = await getPrisma();
    const sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 2 } },
    });
    return sections.map((s: any) => {
      const draft = s.versions?.find((v: any) => v.status === 'draft');
      const pub = s.versions?.find((v: any) => v.status === 'published');
      const active = draft || pub;
      return { ...s, title: active?.title, subtitle: active?.subtitle, settings: active?.settings || {}, status: draft ? 'draft' : 'published' };
    });
  }
  async findByPage(pageId: string) {
    const prisma = await getPrisma();
    const sections = await prisma.homepageSection.findMany({
      where: { pageId }, orderBy: { sortOrder: 'asc' },
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 2 } },
    });
    return sections.map((s: any) => {
      const draft = s.versions?.find((v: any) => v.status === 'draft');
      const pub = s.versions?.find((v: any) => v.status === 'published');
      const active = draft || pub;
      return { ...s, title: active?.title, subtitle: active?.subtitle, settings: active?.settings || {}, status: draft ? 'draft' : 'published' };
    });
  }
  async create(data: any) { const prisma = await getPrisma(); return prisma.homepageSection.create({ data }); }
  async update(id: string, data: any) { const prisma = await getPrisma(); return prisma.homepageSection.update({ where: { id }, data }); }
  async delete(id: string) { const prisma = await getPrisma(); return prisma.homepageSectionVersion.deleteMany({ where: { sectionId: id } }).then(() => prisma.homepageSection.delete({ where: { id } })); }
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
  async findPublic() { const prisma = await getPrisma(); return prisma.testimonial.findMany({ where: { status: 'published' }, orderBy: { sortOrder: 'asc' } }); }
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
