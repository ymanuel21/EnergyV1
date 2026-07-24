import type { Product } from '@/types/product';
import { products as productData } from '@/lib/data/products';

// These functions are used by both Server and Client Components.
// Prisma is only available server-side, so we always return static data.
// Server Components that want live data import from @/lib/api-server instead.

export async function getAllProducts(): Promise<Product[]> {
  return productData;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return productData.find((p) => p.slug === slug);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return productData.filter((p) => p.categoryId === categoryId || p.subcategoryId === categoryId);
}
