import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { getAllArticles } from '@/lib/api/articles';
import { formatDate } from '@/lib/formatDate';

export async function generateMetadata(): Promise<Metadata> {
  const tr = await getTranslations();
  return { title: tr('meta.artikel.title'), description: tr('meta.artikel.description') };
}

export default async function ArticlesPage() {
  const tr = await getTranslations();
  const articles = await getAllArticles();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: tr('common.home'), href: '/' }, { label: tr('catalog.guide') }]} />
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-primary">{tr('meta.artikel.title')}</h1>
        <p className="mt-1 text-sm text-muted">{articles.length} artikel</p>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.slug} href={`/artikel/${article.slug}`}
            className="group rounded-xl border border-border bg-card p-6 transition hover:shadow-md">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{article.category}</span>
              <span>•</span>
              <span>{formatDate(article.date)}</span>
              <span>•</span>
              <span>{article.readTime} menit</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-primary group-hover:text-primary transition-colors">{article.title}</h2>
            <p className="mt-2 text-sm text-muted line-clamp-2">{article.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              {tr('article.readMore')}
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
