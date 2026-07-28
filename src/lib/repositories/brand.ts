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
}

export const brandRepo = new BrandRepository();
