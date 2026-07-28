import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { getAllArticles } from '@/lib/api/articles';

export const metadata: Metadata = {
  title: 'Panduan Energi Surya',
  description: 'Panduan, tips, dan edukasi tentang energi surya, panel surya, inverter, dan baterai.',
  alternates: { canonical: '/artikel' },
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Panduan' }]} />
      <div className="mt-4">
        <h1 className="text-2xl font-bold text-primary">Panduan Energi Surya</h1>
        <p className="mt-1 text-sm text-muted">{articles.length} artikel</p>
      </div>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.slug} href={`/artikel/${article.slug}`}
            className="group rounded-xl border border-border bg-card p-6 transition hover:shadow-md">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{article.category}</span>
              <span>•</span>
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.readTime} menit</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-primary group-hover:text-primary transition-colors">{article.title}</h2>
            <p className="mt-2 text-sm text-muted line-clamp-2">{article.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
              Baca selengkapnya →
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
