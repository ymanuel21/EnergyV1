import type { Product, SortOption } from '@/types/product';

export function filterByCategory(products: Product[], categoryId: string, isSubcategory = false): Product[] {
  if (isSubcategory) {
    return products.filter((p) => p.subcategoryId === categoryId);
  }
  return products.filter(
    (p) => p.categoryId === categoryId || p.subcategoryId === categoryId
  );
}

export function filterByBadge(products: Product[], badge: Product['badges'][number]): Product[] {
  return products.filter((p) => p.badges.includes(badge));
}

export function filterByBrand(products: Product[], brandId: string): Product[] {
  return products.filter((p) => p.brandId === brandId);
}

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query || query.trim().length < 2) return products;

  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/);

  return products
    .map((product) => ({
      product,
      score: calculateRelevance(product, terms),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}

function calculateRelevance(product: Product, terms: string[]): number {
  const text = [
    product.name,
    product.sku,
    product.model ?? '',
    ...product.specifications.map((s) => s.value),
  ].join(' ').toLowerCase();

  let score = 0;
  for (const term of terms) {
    if (product.name.toLowerCase().includes(term)) score += 10;
    if (product.sku.toLowerCase().includes(term)) score += 8;
    if (text.includes(term)) score += 5;
    if (terms.length > 1) score += 2;
  }
  return score;
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'biggest-discount':
      return sorted.sort((a, b) => {
        const da = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const db = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return db - da;
      });
    case 'bestseller':
    case 'most-viewed':
    case 'relevance':
    default:
      return sorted;
  }
}

export function paginate<T>(items: T[], page: number, perPage = 12): { items: T[]; totalPages: number } {
  const totalPages = Math.ceil(items.length / perPage);
  const start = (page - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    totalPages,
  };
}
