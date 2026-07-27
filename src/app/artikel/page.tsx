import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { articles } from '@/lib/data/articles';

export const metadata: Metadata = {
  title: 'Panduan Energi Surya',
  description: 'Panduan, tips, dan edukasi tentang energi surya, panel surya, inverter, dan baterai.',
  alternates: { canonical: '/artikel' },
};

export default function ArticlesPage() {
  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Panduan' }]} />

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-gray-900">Panduan Energi Surya</h1>
        <p className="mt-1 text-sm text-gray-500">{articles.length} artikel</p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/artikel/${article.slug}`}
            className="group rounded-xl border border-gray-200 p-6 transition hover:shadow-md hover:border-gray-200"
          >
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{article.category}</span>
              <span>•</span>
              <span>{article.date}</span>
              <span>•</span>
              <span>{article.readTime} menit</span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">
              {article.title}
            </h2>
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-900 group-hover:gap-2 transition-all">
              Baca selengkapnya
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </Container>
  );
}
