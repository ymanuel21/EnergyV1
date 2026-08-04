import type { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { getArticleBySlug } from '@/lib/api/articles';
import { formatDate } from '@/lib/formatDate';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'Artikel Tidak Ditemukan' };
  return { title: article.title, description: article.excerpt, alternates: { canonical: `/artikel/${slug}` } };
}

export default async function ArticleDetail({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const allArticles = await getAllArticles();
  const related = allArticles.filter((a: any) => a.slug !== article.slug && a.category === article.category).slice(0, 3);

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Panduan', href: '/artikel' }, { label: article.title }]} />
      <article className="mx-auto mt-6 max-w-3xl">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>{article.category}</span><span>•</span>
          <span>{formatDate(article.date)}</span><span>•</span>
          <span>{article.readTime} menit</span><span>•</span>
          <span>{article.author}</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-primary sm:text-3xl">{article.title}</h1>
        <div className="prose mt-6 max-w-none text-muted">
          {article.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="mt-8 mb-3 text-xl font-semibold text-primary">{line.replace('## ', '')}</h2>;
            if (line.startsWith('- ')) return <li key={i} className="ml-4 text-muted">{line.replace('- ', '')}</li>;
            if (line.startsWith('### ')) return <h3 key={i} className="mt-6 mb-2 text-lg font-semibold text-primary-hover">{line.replace('### ', '')}</h3>;
            if (line.trim() === '') return <br key={i} />;
            if (line.startsWith('**')) return <p key={i} className="font-semibold text-primary">{line.replace(/\*\*/g, '')}</p>;
            return <p key={i} className="text-muted leading-relaxed">{line}</p>;
          })}
        </div>
      </article>
      {related.length > 0 && (
        <div className="mx-auto mt-12 max-w-3xl border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-primary">Artikel Terkait</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((r: any) => (
              <Link key={r.slug} href={`/artikel/${r.slug}`} className="rounded-lg border border-border bg-card p-4 hover:shadow-sm transition">
                <p className="text-xs text-muted">{r.category} • {r.readTime} menit</p>
                <h3 className="mt-1 text-sm font-medium text-primary line-clamp-2">{r.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
