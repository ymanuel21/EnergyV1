import 'server-only';
import type { Article } from '@/types/article';
import { prismaOrFallback } from '@/lib/db';

export async function getAllArticles(): Promise<Article[]> {
  return prismaOrFallback<Article[]>(
    async (prisma) => {
      const rows = await prisma.article.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
      });
      return rows.map((a: any) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt ?? null,
        content: a.content,
        category: a.category ?? null,
        image: a.image ?? null,
        author: a.author,
        readTime: a.readTime ?? null,
        date: a.publishedAt?.toISOString() ?? a.createdAt?.toISOString(),
        publishedAt: a.publishedAt?.toISOString() ?? null,
        createdAt: a.createdAt?.toISOString() ?? new Date().toISOString(),
      }));
    },
    async () => (await import('@/lib/data/articles')).articles as any[],
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return prismaOrFallback<Article | undefined>(
    async (prisma) => {
      const a: any = await prisma.article.findUnique({ where: { slug } });
      if (!a) return undefined;
      return {
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt ?? null,
        content: a.content,
        category: a.category ?? null,
        image: a.image ?? null,
        author: a.author,
        readTime: a.readTime ?? null,
        date: a.publishedAt?.toISOString() ?? a.createdAt?.toISOString(),
        publishedAt: a.publishedAt?.toISOString() ?? null,
        createdAt: a.createdAt?.toISOString() ?? new Date().toISOString(),
      };
    },
    async () => (await import('@/lib/data/articles')).articles.find((a: any) => a.slug === slug) as any,
  );
}
