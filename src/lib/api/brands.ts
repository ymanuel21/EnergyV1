import { brands as brandData } from '@/lib/data/brands';

export async function getAllBrands() { return brandData; }
export async function getBrandById(id: string) { return brandData.find((b) => b.id === id); }
export async function getBrandBySlug(slug: string) { return brandData.find((b) => b.slug === slug); }
export async function getActiveBrands() { return brandData; }
