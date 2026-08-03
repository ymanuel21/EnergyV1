import type { Metadata } from 'next';
import { Container } from '@ui/Container';
import { Breadcrumb } from '@ui/Breadcrumb';
import { getPageBySlug } from '@/lib/api/static-pages';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function RenderContent({ content }: { content: string }) {
  // If content looks like HTML (starts with tag), render as HTML
  if (content.trim().startsWith('<')) {
    return <div className="prose prose-sm sm:prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />;
  }
  // Otherwise render as Markdown
  return (
    <div className="prose prose-sm sm:prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export const revalidate = 3600;

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: 'Halaman Tidak Ditemukan' };
  return { title: page.title, description: page.description, alternates: { canonical: `/halaman/${slug}` } };
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: page.title }]} />
      <article className="mx-auto mt-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">{page.title}</h1>
        <RenderContent content={page.content} />
      </article>
    </Container>
  );
}
