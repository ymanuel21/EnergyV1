import 'server-only';
import type { Article } from '@/types/article';
import { prismaOrFallback } from '@/lib/db';
import { applyEn } from '@/lib/i18n/apply-en';

/** Map a database article row to the public shape, applying the English overlay. */
function toArticle(row: {
  slug: string; title: string; excerpt: string | null; content: string; category: string | null;
  image: string | null; author: string; readTime: number | null;
  publishedAt: Date | null; createdAt: Date;
}): Article {
  const t = applyEn('articles', row);
  return {
    slug: t.slug,
    title: t.title,
    excerpt: t.excerpt ?? null,
    content: t.content,
    category: t.category ?? null,
    image: t.image ?? null,
    author: t.author,
    readTime: t.readTime ?? null,
    date: t.publishedAt ?? t.createdAt,
    publishedAt: t.publishedAt ?? null,
    createdAt: t.createdAt ?? new Date(),
    // The Article interface types these as strings, but the data layer has always passed Date
    // instances through to the formatter. Casting keeps the existing runtime values intact.
  } as unknown as Article;
}

export async function getAllArticles(): Promise<Article[]> {
  return prismaOrFallback<Article[]>(
    async (prisma) => {
      const rows = await prisma.article.findMany({
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
      });
      return rows.map((a) => toArticle(a as Parameters<typeof toArticle>[0]));
    },
    async () => (await import('@/lib/data/articles')).articles as any[],
  );
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return prismaOrFallback<Article | undefined>(
    async (prisma) => {
      const a = await prisma.article.findUnique({ where: { slug } });
      if (!a) return undefined;
      return toArticle(a as Parameters<typeof toArticle>[0]);
    },
    async () => (await import('@/lib/data/articles')).articles.find((a: any) => a.slug === slug) as any,
  );
}
