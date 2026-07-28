import { getPrisma } from '@/lib/db';
import type { Product } from '@/types/product';

export interface ProductQuery {
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
  brandId?: string;
  categoryId?: string;
  search?: string;
  badges?: string[];
  isActive?: boolean;
  includeBrand?: boolean;
  includeCategories?: boolean;
  includeBadges?: boolean;
}

export class ProductRepository {
  async findAll(params?: ProductQuery): Promise<Product[]> {
    const prisma = await getPrisma();
    const where: any = { isActive: params?.isActive ?? true };
    if (params?.brandId) where.brandId = params.brandId;
    if (params?.categoryId) where.categories = { some: { categoryId: params.categoryId } };
    if (params?.search) where.name = { contains: params.search };
    const orderBy = params?.sort === 'price_asc' ? { price: 'asc' as const }
      : params?.sort === 'price_desc' ? { price: 'desc' as const }
      : params?.sort === 'name' ? { name: 'asc' as const }
      : { createdAt: 'desc' as const };

    return prisma.product.findMany({
      where, orderBy,
      take: params?.limit, skip: params?.offset,
      include: {
        brand: params?.includeBrand ?? true,
        categories: params?.includeCategories ? { include: { category: true } } : false,
        badgeRelations: params?.includeBadges ? { include: { badge: true } } : false,
      },
    }) as unknown as Product[];
  }

  async count(params?: Omit<ProductQuery, 'limit' | 'offset' | 'sort'>): Promise<number> {
    const prisma = await getPrisma();
    const where: any = { isActive: params?.isActive ?? true };
    if (params?.brandId) where.brandId = params.brandId;
    if (params?.categoryId) where.categories = { some: { categoryId: params.categoryId } };
    if (params?.search) where.name = { contains: params.search };
    return prisma.product.count({ where });
  }

  async findBySlug(slug: string): Promise<Product | undefined> {
    const prisma = await getPrisma();
    return prisma.product.findUnique({
      where: { slug },
      include: { brand: true, categories: { include: { category: true } }, badgeRelations: { include: { badge: true } } },
    }) as unknown as Product | undefined;
  }

  async findById(id: string): Promise<Product | undefined> {
    const prisma = await getPrisma();
    return prisma.product.findUnique({
      where: { id },
      include: { brand: true, categories: { include: { category: true } }, badgeRelations: { include: { badge: true } } },
    }) as unknown as Product | undefined;
  }
}

export const productRepo = new ProductRepository();
