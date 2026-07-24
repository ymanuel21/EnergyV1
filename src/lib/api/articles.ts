import { articles as articleData } from '@/lib/data/articles';
export async function getAllArticles() { return articleData; }
export async function getArticleBySlug(slug: string) { return articleData.find((a: any) => a.slug === slug); }
