import { categories as categoryData } from '@/lib/data/categories';
export async function getAllCategories() { return categoryData; }
export async function getCategoryBySlug(slug: string) { return categoryData.find((c: any) => c.slug === slug); }
