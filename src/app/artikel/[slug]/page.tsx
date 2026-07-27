import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { articles } from '@/lib/data/articles';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return { title: 'Artikel Tidak Ditemukan' };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/artikel/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
    },
  };
}

export default async function ArticleDetail({ params }: Props) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = articles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 3);

  return (
    <Container className="py-6">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Panduan', href: '/artikel' },
          { label: article.title },
        ]}
      />

      <article className="mx-auto mt-6 max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{article.category}</span>
          <span>•</span>
          <span>{article.date}</span>
          <span>•</span>
          <span>{article.readTime} menit baca</span>
          <span>•</span>
          <span>{article.author}</span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-gray-900 sm:text-3xl">{article.title}</h1>

        <div className="prose mt-6 max-w-none text-gray-700">
          {article.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) {
              return <h2 key={i} className="mt-8 mb-3 text-xl font-semibold text-gray-900">{line.replace('## ', '')}</h2>;
            }
            if (line.startsWith('- ')) {
              return <li key={i} className="ml-4 text-gray-600">{line.replace('- ', '')}</li>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={i} className="mt-6 mb-2 text-lg font-semibold text-gray-800">{line.replace('### ', '')}</h3>;
            }
            if (line.trim() === '') return <br key={i} />;
            if (line.startsWith('**')) {
              return <p key={i} className="font-semibold text-gray-900">{line.replace(/\*\*/g, '')}</p>;
            }
            return <p key={i} className="text-gray-600 leading-relaxed">{line}</p>;
          })}
        </div>
      </article>

      {related.length > 0 && (
        <div className="mx-auto mt-12 max-w-3xl border-t border-gray-200 pt-8">
          <h2 className="text-lg font-semibold text-gray-900">Artikel Terkait</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/artikel/${r.slug}`}
                className="rounded-lg border border-gray-200 p-4 hover:border-gray-200 hover:shadow-sm transition-colors"
              >
                <p className="text-xs text-gray-400">{r.category} • {r.readTime} menit</p>
                <h3 className="mt-1 text-sm font-medium text-gray-900 line-clamp-2">{r.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
