import type { Product, SortOption } from '@/types/product';
import type { Category } from '@/types/product';

function getAllChildIds(category: Category): string[] {
  const ids = [category.id];
  if (category.children) {
    for (const child of category.children) {
      ids.push(...getAllChildIds(child as Category));
    }
  }
  return ids;
}

export function filterByCategory(
  products: Product[],
  categoryId: string,
  category?: Category | null
): Product[] {
  // If we have the full category tree, use it to include child products
  if (category) {
    const allIds = getAllChildIds(category);
    return products.filter((p) => allIds.includes(p.categoryId) || allIds.includes(p.subcategoryId as string));
  }

  // Fallback: filter by categoryId or subcategoryId
  return products.filter(
    (p) => p.categoryId === categoryId || (p as any).subcategoryId === categoryId
  );
}

export function filterByBadge(products: Product[], badge: Product['badges'][number]): Product[] {
  return products.filter((p) => p.badges.includes(badge));
}

export function filterByBrand(products: Product[], brandId: string): Product[] {
  return products.filter((p) => p.brandId === brandId);
}

export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
  );
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'popular':
      return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    case 'discount':
      return sorted.sort((a, b) => {
        const aDisc = a.originalPrice ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const bDisc = b.originalPrice ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return bDisc - aDisc;
      });
    default:
      return sorted;
  }
}

export function paginate<T>(items: T[], page: number, perPage = 12): { items: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const start = (Math.min(page, totalPages) - 1) * perPage;
  return { items: items.slice(start, start + perPage), totalPages };
}
