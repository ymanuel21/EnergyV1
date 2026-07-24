import { staticPages as pageData } from '@/lib/data/static-pages';
export async function getAllPages() { return pageData; }
export async function getPageBySlug(slug: string) { return pageData.find((p: any) => p.slug === slug); }
