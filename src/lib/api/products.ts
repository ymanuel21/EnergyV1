import { cache as memoize } from 'react';
import { getPrisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import type { Product, SortOption } from '@/types/product';
import { localizeRow, localizeRows } from '@/lib/i18n/server';
interface ListParams {
  limit?: number;
  offset?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'name';
  brandId?: string;
  categoryId?: string;
  search?: string;
  preview?: boolean;
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

// ============================================================================
// Public visibility — the single definition of "product the public may see".
// (Phase 1: hoisted so every read path filters in SQL instead of in JavaScript.)
// ============================================================================
const PUBLIC_PRODUCT_WHERE = { isActive: true, status: 'published', brand: { isActive: true } } as const;

// ============================================================================
// Phase 1 projections.
//   BEFORE: findMany({ include: {...} }) with no `select` returned every column
//   (description ~575 B, specifications ~1 047 B per product) plus 4 relations
//   for every row -> 480 591 B of DB payload for the catalogue.
//   AFTER: each consumer asks only for the fields it renders.
// ============================================================================
const BRAND_REF_SELECT = { id: true, name: true, slug: true, logo: true, isActive: true } as const;
const BADGE_REF_SELECT = { id: true, name: true, slug: true, color: true, bgColor: true, icon: true } as const;

/** Fields the product CARD renders (ProductCard / ProductCardItem) + pricing + the
 *  fields the compare/wishlist pages add to the cart. No description, no
 *  specifications, no downloads, no draftData. */
export const PRODUCT_CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  price: true,
  originalPrice: true,
  priceDisplayMode: true,
  customPriceLabel: true,
  stock: true,
  sku: true,
  model: true,
  capacity: true,
  familyKey: true,
  weight: true,
  warranty: true,
  condition: true,
  images: true,
  badges: true,
  isActive: true,
  status: true,
  brandId: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
  brand: { select: BRAND_REF_SELECT },
  badgeRelations: { select: { badge: { select: BADGE_REF_SELECT } } },
  categories: { select: { categoryId: true } },
} as const satisfies Prisma.ProductSelect;

/** Everything the product DETAIL page (/produk/[slug]) renders. */
export const PRODUCT_DETAIL_SELECT = {
  ...PRODUCT_CARD_SELECT,
  description: true,
  specifications: true,
  downloads: true,
  relations: {
    select: {
      relatedProductId: true,
      type: true,
      sortOrder: true,
      relatedProduct: { select: PRODUCT_CARD_SELECT },
    },
  },
} as const satisfies Prisma.ProductSelect;

/** Sitemap entries need an identifier and a timestamp — nothing else. */
export const PRODUCT_SITEMAP_SELECT = { slug: true, updatedAt: true } as const satisfies Prisma.ProductSelect;

type SortInput = SortOption | 'relevance' | 'newest' | 'price-asc' | 'price-desc' | 'rating'
  | 'bestseller' | 'most-viewed' | 'biggest-discount' | 'price_asc' | 'price_desc' | 'name';

/**
 * Reproduces `sortProducts()` (src/lib/api/filters.ts) exactly, in SQL.
 * The old JS sorter was a STABLE sort over the createdAt-desc input, so every
 * "no-op" sort (relevance / rating / bestseller / most-viewed / biggest-discount
 * — rating & reviewCount are not columns, so they compared 0 vs 0) preserved the
 * input order. That is what the createdAt-desc tiebreaker reproduces here.
 */
export function toOrderBy(sort?: SortInput): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-asc': case 'price_asc':
      return [{ price: 'asc' }, { createdAt: 'desc' }];
    case 'price-desc': case 'price_desc':
      return [{ price: 'desc' }, { createdAt: 'desc' }];
    case 'name':
      return [{ name: 'asc' }, { createdAt: 'desc' }];
    default:
      return [{ createdAt: 'desc' }];
  }
}

// ============================================================================
// Catalogue reads (card projection)
// ============================================================================

/** Public catalogue, card projection. Kept for the listing-style callers. */
export async function getAllProducts(params?: ListParams): Promise<Product[]> {
  try {
    const prisma = await getPrisma();
    const where: any = { ...PUBLIC_PRODUCT_WHERE, status: params?.preview ? undefined : 'published' };
    if (params?.brandId) where.brandId = params.brandId;
    if (params?.categoryId) {
      where.categories = { some: { categoryId: params.categoryId } };
    }
    if (params?.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const rows = await prisma.product.findMany({      where,
      orderBy: toOrderBy(params?.sort),
      take: params?.limit || undefined,
      skip: params?.offset || undefined,
      select: PRODUCT_CARD_SELECT,
    });
    return localizeRows('products', rows) as unknown as Product[];  } catch {
    // Fallback to static data only if DB unavailable
    try {
      const { products } = await import('@/lib/data/products');
      return localizeRows('products', products) as unknown as Product[];    } catch { return []; }
  }
}

async function getProductsPaginatedImpl(params?: ListParams): Promise<PaginatedResponse<Product>> {
  const limit = params?.limit || PAGE_DEFAULTS.limit;
  const offset = params?.offset || PAGE_DEFAULTS.offset;
  try {
  const prisma = await getPrisma();
  const where: any = {
    ...PUBLIC_PRODUCT_WHERE,
    isActive: params?.isActive ?? true,
    status: params?.preview ? undefined : 'published',
  };  if (params?.brandId) where.brandId = params.brandId;
  if (params?.categoryId) where.categories = { some: { categoryId: params.categoryId } };
  if (params?.search) where.name = { contains: params.search, mode: 'insensitive' };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: toOrderBy(params?.sort),
      take: limit,
      skip: offset,
      select: PRODUCT_CARD_SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: await localizeRows('products', items) as unknown as Product[],
    total,
    limit,
    offset,
    hasMore: offset + limit < total,
  };
  } catch (e) {
    // The database is unreachable or unset: serve the catalogue from the offline dataset so the
    // product listing still renders instead of failing the page.
    console.error('getProductsPaginated failed:', (e as Error).message);
    const all = (await import('@/lib/data/products')).products as unknown as Product[];
    const term = params?.search?.toLowerCase();
    const filtered = term ? all.filter((p) => (p.name ?? '').toLowerCase().includes(term)) : all;
    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      limit,
      offset,
      hasMore: offset + limit < filtered.length,
    };
  }
}

/** Products for one brand, filtered in SQL (was: whole catalogue + JS filter). */
export async function getProductsByBrand(brandId: string, params?: { limit?: number; offset?: number; sort?: SortInput }): Promise<Product[]> {
  return getAllProducts({ brandId, sort: params?.sort as ListParams['sort'], limit: params?.limit, offset: params?.offset });
}

/** Specific products by id (wishlist) — replaces fetching the whole catalogue. */
export async function getProductsByIds(ids: string[], limit = 100): Promise<Product[]> {
  if (!ids.length) return [];
  const prisma = await getPrisma();
  const rows = await prisma.product.findMany({
    where: { ...PUBLIC_PRODUCT_WHERE, id: { in: ids.slice(0, limit) } },
    orderBy: { createdAt: 'desc' },
    select: PRODUCT_CARD_SELECT,
  });
  return rows as unknown as Product[];
}

/** Specific products by slug (comparison page) — replaces the whole catalogue. */
export async function getProductsBySlugs(slugs: string[], limit = 100): Promise<Product[]> {
  if (!slugs.length) return [];
  const prisma = await getPrisma();
  const rows = await prisma.product.findMany({
    where: { ...PUBLIC_PRODUCT_WHERE, slug: { in: slugs.slice(0, limit) } },
    orderBy: { createdAt: 'desc' },
    select: PRODUCT_CARD_SELECT,
  });
  return rows as unknown as Product[];
}

/** Category listing with SQL filtering + sorting + pagination.
 *  Mirrors `filterByCategory()` (m2m `categories`, falling back to the legacy
 *  single `categoryId` only for products that have no m2m rows) and the
 *  `paginate()` clamp (`Math.min(page, totalPages)`). */
export async function getCategoryProducts(opts: {
  categoryIds: string[];
  sort?: SortInput;
  page?: number;
  perPage?: number;
}): Promise<{ items: Product[]; total: number; totalPages: number }> {
  const perPage = opts.perPage ?? 12;
  const prisma = await getPrisma();
  const where: any = {
    ...PUBLIC_PRODUCT_WHERE,
    OR: [
      { categories: { some: { categoryId: { in: opts.categoryIds } } } },
      { AND: [{ categories: { none: {} } }, { categoryId: { in: opts.categoryIds } }] },
    ],
  };
  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, opts.page ?? 1), totalPages);
  const items = await prisma.product.findMany({
    where,
    orderBy: toOrderBy(opts.sort),
    take: perPage,
    skip: (page - 1) * perPage,
    select: PRODUCT_CARD_SELECT,
  });
  return { items: items as unknown as Product[], total, totalPages };
}

/** Badge listings (promo / clearance) with SQL filtering. `badges` is a Json
 *  string array; `array_contains` reproduces `p.badges.includes(badge)`. */
async function getProductsByBadgeImpl(badge: string, opts?: {
  sort?: SortInput; page?: number; perPage?: number;
}): Promise<{ items: Product[]; total: number; totalPages: number }> {
  const perPage = opts?.perPage ?? 12;
  const prisma = await getPrisma();
  const where: any = { ...PUBLIC_PRODUCT_WHERE, badges: { array_contains: badge } };
  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, opts?.page ?? 1), totalPages);
  const items = await prisma.product.findMany({
    where,
    orderBy: toOrderBy(opts?.sort),
    take: perPage,
    skip: (page - 1) * perPage,
    select: PRODUCT_CARD_SELECT,
  });
  return { items: items as unknown as Product[], total, totalPages };
}

/** Search with SQL filtering — same six fields as `searchProducts()` in filters.ts. */
export async function searchProductsPaginated(opts: {
  q: string; sort?: SortInput; page?: number; perPage?: number;
}): Promise<{ items: Product[]; total: number; totalPages: number }> {
  const perPage = opts.perPage ?? 12;
  const q = opts.q.trim();
  if (q.length < 2) return { items: [], total: 0, totalPages: 1 };
  const prisma = await getPrisma();
  const where: any = {
    ...PUBLIC_PRODUCT_WHERE,
    OR: (['name', 'description', 'sku', 'model', 'capacity', 'familyKey'] as const).map((f) => ({
      [f]: { contains: q, mode: 'insensitive' },
    })),
  };
  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, opts.page ?? 1), totalPages);
  const items = await prisma.product.findMany({
    where,
    orderBy: toOrderBy(opts.sort),
    take: perPage,
    skip: (page - 1) * perPage,
    select: PRODUCT_CARD_SELECT,
  });
  return { items: items as unknown as Product[], total, totalPages };
}

// ============================================================================
// Detail reads
// ============================================================================

/** Detail + public visibility checks. Memoised per request so the page body and
 *  generateMetadata share one query instead of issuing two identical ones. */
export const getProductBySlug = memoize(async function getProductBySlug(slug: string): Promise<Product | undefined> {
  try {
    const prisma = await getPrisma();
    const row = await prisma.product.findUnique({ where: { slug }, select: PRODUCT_DETAIL_SELECT });
    if (row && !row.isActive) return undefined; // Hide inactive products from public detail
    if (row && row.status !== 'published') return undefined; // Hide drafts/archived from public
    if (row && row.brand && !row.brand.isActive) return undefined; // Hide products of disabled brands
    return localizeRow('products', row) as unknown as Product;
  } catch {
    const { products } = await import('@/lib/data/products');
    return (products as unknown as Product[]).find((p) => p.slug === slug);
  }
});

/** Related products for the detail page, without reading the whole catalogue. */
export async function getRelatedProducts(opts: {
  productId: string;
  relationIds?: string[];
  categoryId?: string | null;
  limit?: number;
}): Promise<Product[]> {
  try {
    const prisma = await getPrisma();
    if (opts.relationIds?.length) {
      return (await prisma.product.findMany({
        where: { ...PUBLIC_PRODUCT_WHERE, id: { in: opts.relationIds } },
        orderBy: { createdAt: 'desc' },
        take: opts.limit ?? 10,
        select: PRODUCT_CARD_SELECT,
      })) as unknown as Product[];
    }
    if (!opts.categoryId) return [];
    return (await prisma.product.findMany({
      where: { ...PUBLIC_PRODUCT_WHERE, id: { not: opts.productId }, categoryId: opts.categoryId },
      orderBy: { createdAt: 'desc' },
      take: opts.limit ?? 5,
      select: PRODUCT_CARD_SELECT,
    })) as unknown as Product[];
  } catch {
    return [];
  }
}

/** Every visible product slug — for generateStaticParams (slug only). */
export async function getProductSlugs(): Promise<string[]> {
  try {
    const prisma = await getPrisma();
    const rows = await prisma.product.findMany({ where: PUBLIC_PRODUCT_WHERE, select: { slug: true } });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}

/** Slug + timestamp only — for the sitemap. */
export async function getProductsForSitemap(): Promise<{ slug: string; updatedAt: Date }[]> {
  try {
    const prisma = await getPrisma();
    return await prisma.product.findMany({
      where: PUBLIC_PRODUCT_WHERE,
      select: PRODUCT_SITEMAP_SELECT,
    });
  } catch {
    return [];
  }
}

/**
 * Products referenced by homepage/landing SECTIONS, with the DETAIL projection.
 * Replaces `getAllProducts()` on `/` and `/[slug]`: the section renderers only
 * ever resolve products by id/slug or take the first `maxProducts` of the
 * catalogue order, so only the head of that order plus the referenced rows are
 * needed. `products.slice(0, max)` therefore still returns the identical list.
 */
export async function getProductsForSections(
  sections: Array<{ type?: string; settings?: Record<string, unknown> | null }>,
): Promise<Product[]> {
  const refIds = new Set<string>();
  let headCount = 0;
  for (const s of sections || []) {
    const settings = (s?.settings || {}) as Record<string, any>;
    if (s?.type === 'featured-products') {
      const ids = Array.isArray(settings.productIds) ? settings.productIds : [];
      if (ids.length) ids.forEach((id: unknown) => typeof id === 'string' && id && refIds.add(id));
      else headCount = Math.max(headCount, Number(settings.maxProducts) || 4);
    }
    if (s?.type === 'hero') {
      // heroProductId may be a string or an array (the renderer takes [0]).
      const raw = settings.heroProductId;
      const candidates = Array.isArray(raw) ? raw : [raw];
      candidates.forEach((v: unknown) => typeof v === 'string' && v && refIds.add(v));
    }
    if (typeof settings.featuredProductId === 'string' && settings.featuredProductId) {
      refIds.add(settings.featuredProductId);
    }
  }

  const ids = [...refIds];
  const REF_SELECT = PRODUCT_DETAIL_SELECT;
  try {
    const prisma = await getPrisma();
    const [head, refs] = await Promise.all([
      headCount > 0
        ? prisma.product.findMany({
            where: PUBLIC_PRODUCT_WHERE,
            orderBy: { createdAt: 'desc' },
            take: headCount,
            select: REF_SELECT,
          })
        : Promise.resolve([] as any[]),
      ids.length
        ? prisma.product.findMany({
            where: { ...PUBLIC_PRODUCT_WHERE, OR: [{ id: { in: ids } }, { slug: { in: ids } }] },
            select: REF_SELECT,
          })
        : Promise.resolve([] as any[]),
    ]);
    const seen = new Set<string>();
    const merged: any[] = [];
    for (const row of [...head, ...refs]) {
      if (row && !seen.has(row.id)) { seen.add(row.id); merged.push(row); }
    }
    return merged as unknown as Product[];
  } catch {
    return [];
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const prisma = await getPrisma();
  const rows = await prisma.productCategory.findMany({
    where: { categoryId, product: { isActive: true, status: 'published', brand: { isActive: true } } },
    select: { product: { select: PRODUCT_CARD_SELECT } },
  });
  return localizeRows('products', rows.map(r => r.product)) as unknown as Product[];
}

/** Per-brand product counts for the /brand index. The page previously read the
 *  whole catalogue just to count rows per brandId. */
async function getProductCountsByBrandImpl(): Promise<Record<string, number>> {
  const prisma = await getPrisma();
  const rows = await prisma.product.groupBy({
    by: ['brandId'],
    where: PUBLIC_PRODUCT_WHERE,
    _count: { _all: true },
  });
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.brandId] = r._count._all;
  return counts;
}

// ---------------------------------------------------------------------------
// Public-read guards.
// Each `*Impl` above is the untouched query; the exported wrapper enforces the
// documented project standard: a database outage degrades a public page, it
// never turns it into a 500.
//
// `await` inside the guard is MANDATORY. Returning the Prisma promise directly
// (`return prisma.x.findMany()`) escapes the surrounding try/catch when the
// driver adapter fails, which is exactly how the site was returning 500 on
// `/`, `/produk`, `/promo`, `/brand`, `/proyek`, `/testimoni` and
// `/barang-clearance` during the Neon quota outage (error 53000 / Prisma P2039).
// ---------------------------------------------------------------------------
async function publicRead<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[public-read] ${label} failed:`, (e as Error)?.message);
    return fallback;
  }
}

export function getProductsPaginated(params?: ListParams): Promise<PaginatedResponse<Product>> {
  const limit = params?.limit || PAGE_DEFAULTS.limit;
  const offset = params?.offset || PAGE_DEFAULTS.offset;
  return publicRead(
    'getProductsPaginated',
    () => getProductsPaginatedImpl(params),
    { items: [], total: 0, limit, offset, hasMore: false },
  );
}

export function getProductsByBadge(badge: string, opts?: {
  sort?: SortInput; page?: number; perPage?: number;
}): Promise<{ items: Product[]; total: number; totalPages: number }> {
  return publicRead(
    'getProductsByBadge',
    () => getProductsByBadgeImpl(badge, opts),
    { items: [], total: 0, totalPages: 1 },
  );
}

export function getProductCountsByBrand(): Promise<Record<string, number>> {
  return publicRead('getProductCountsByBrand', () => getProductCountsByBrandImpl(), {});
}
