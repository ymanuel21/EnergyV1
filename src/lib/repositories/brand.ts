import { getPrisma } from '@/lib/db';

export class BrandRepository {
  async findAll(isActive?: boolean) {
    const prisma = await getPrisma();
    return prisma.brand.findMany({
      where: isActive !== undefined ? { isActive } : {},
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const prisma = await getPrisma();
    return prisma.brand.findUnique({ where: { slug } });
  }

  async findById(id: string) {
    const prisma = await getPrisma();
    return prisma.brand.findUnique({ where: { id } });
  }

  async create(data: { name: string; slug: string; logo?: string }) {
    const prisma = await getPrisma();
    const id = `brand-${data.slug}`;
    return prisma.brand.create({ data: { id, ...data, logo: data.logo || '' } });
  }

  async update(id: string, data: { name?: string; logo?: string; isActive?: boolean }) {
    const prisma = await getPrisma();
    return prisma.brand.update({ where: { id }, data });
  }

  async delete(id: string) {
    const prisma = await getPrisma();
    return prisma.brand.delete({ where: { id } });
  }

  async count() {
    const prisma = await getPrisma();
    return prisma.brand.count();
  }

  /** Brands with the most active products first. Auto-synced with CRUD. */
  async findPopular(limit = 6) {
    const prisma = await getPrisma();
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
      orderBy: { products: { _count: 'desc' } },
      take: limit,
    });
    return brands.map(b => ({ id: b.id, name: b.name, slug: b.slug, productCount: b._count.products }));
  }
}

export const brandRepo = new BrandRepository();
