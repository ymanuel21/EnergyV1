import type { Brand } from '@/types/product';
import { brands as brandArray } from '@/lib/data/brands';

// O(1) lookup — prevents quadratic behavior when N products × M brands
const byId = new Map(brandArray.map((b) => [b.id, b]));
const bySlug = new Map(brandArray.map((b) => [b.slug, b]));

export function getBrandById(id: string): Brand | undefined {
  return byId.get(id);
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return bySlug.get(slug);
}

export function getAllBrands(): Brand[] {
  return brandArray;
}

export function getActiveBrands(): Brand[] {
  return brandArray.filter((b) => b.productCount > 0);
}
