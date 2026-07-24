import type { Product } from '@/types/product';
import { products as productData } from '@/lib/data/products';

// Future: when products move to JSON/CMS, only this file changes
export function getAllProducts(): Product[] {
  return productData;
}

export function getProductBySlug(slug: string): Product | undefined {
  return productData.find((p) => p.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return productData.filter((p) => p.categoryId === categoryId || p.subcategoryId === categoryId);
}
