import { getPrisma } from '@/lib/db';
import type { Product } from '@/types/product';

interface ListParams {
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
  brandId?: string;
  categoryId?: string;
  search?: string;
  badges?: string[];
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

const PAGE_DEFAULTS = { limit: 24, offset: 0 };

export async function getAllProducts(params?: ListParams): Promise<Product[]> {
  try {
    const prisma = await getPrisma();
    const where: any = { isActive: params?.isActive ?? true };
    if (params?.brandId) where.brandId = params.brandId;
    if (params?.categoryId) {
      where.categories = { some: { categoryId: params.categoryId } };
    }
    if (params?.search) {
      where.name = { contains: params.search };
    }
    const orderBy = params?.sort === 'price_asc' ? { price: 'asc' as const } :
                     params?.sort === 'price_desc' ? { price: 'desc' as const } :
                     params?.sort === 'name' ? { name: 'asc' as const } :
                     { createdAt: 'desc' as const };

    return prisma.product.findMany({
      where,
      orderBy,
      take: params?.limit || undefined,
      skip: params?.offset || undefined,
      include: { brand: true, badgeRelations: { include: { badge: true } }, categories: { include: { category: true } } },
    }) as unknown as Product[];
  } catch {
    // Fallback to static data only if DB unavailable
    try {
      const { products } = await import('@/lib/data/products');
      return products as Product[];
    } catch { return []; }
  }
}

export async function getProductsPaginated(params?: ListParams): Promise<PaginatedResponse<Product>> {
  const limit = params?.limit || PAGE_DEFAULTS.limit;
  const offset = params?.offset || PAGE_DEFAULTS.offset;
  const prisma = await getPrisma();
  const where: any = { isActive: params?.isActive ?? true };
  if (params?.brandId) where.brandId = params.brandId;
  if (params?.categoryId) where.categories = { some: { categoryId: params.categoryId } };
  if (params?.search) where.name = { contains: params.search };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { brand: true, badgeRelations: { include: { badge: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items as unknown as Product[],
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const prisma = await getPrisma();
    const row = await prisma.product.findUnique({
      where: { slug },
      include: { brand: true, badgeRelations: { include: { badge: true } }, categories: { include: { category: true } } },
    });
    return row as unknown as Product | undefined;
  } catch {
    const { products } = await import('@/lib/data/products');
    return (products as Product[]).find((p) => p.slug === slug);
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const prisma = await getPrisma();
  const rows = await prisma.productCategory.findMany({
    where: { categoryId },
    include: { product: { include: { brand: true, badgeRelations: { include: { badge: true } } } } },
  });
  return rows.map(r => r.product) as unknown as Product[];
}
